import * as Security from 'System/Helpers/Security';

import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { BadRequest, Forbidden, NotFound, InternalError } from 'System/Error';
import { RoleBasedAccessControl } from 'System/RBAC';
import { BrandModel } from 'App/Models/BrandModel';
import { generateResetPasswordToken } from 'App/Helpers/Generator';
import { MailType } from 'App/Models/MailModel';
import { RoleModel } from 'System/RBAC/Models/RoleModel';
import { MailProducer } from 'System/Mail/MailProducer';

@Injectable
export class BrandAuthService {
    constructor(
        private readonly _config: Config,
        private readonly _mail: MailProducer,
        private readonly _brandModel: BrandModel,
        private readonly _service: RoleBasedAccessControl,
        private readonly _mongo: Mongo,
        private readonly _role: RoleModel
    ) {}

    async login(email: string, password: string, remember: number = 0, avatarUrlInfo?: any) {
        let brand = await this._brandModel.findByEmail(email).select('+password');

        if (!brand) throw new NotFound('BRAND_NOT_FOUND');

        if (brand && brand.is_disabled) throw new Forbidden('BRAND_IS_DISABLED');

        if (brand && Security.compare(this._config.security.pepper + password, brand.password)) {
            let expire: string = this._config.jwt.expire;
            if (remember == 1) expire = this._config.jwt.remember;

            let brandRole = await this._role.findOne({ name: 'Brand' });

            if (!brandRole) throw new InternalError('BRAND_ROLE_NOT_FOUND');

            // make jwt token
            let token = Security.signToken(
                { id: brand.id, name: brand.name, roles: [brandRole.id] },
                this._config.jwt.key,
                expire
            );

            brand.password = '';

            let permissions = await this._service.getRouteListByRoles([brandRole.id]);

            if (avatarUrlInfo) {
                brand.avatar_url = avatarUrlInfo.baseUrl + brand.id + avatarUrlInfo.path;
            }

            return { info: brand, permissions: permissions, token: token };
        } else {
            throw new BadRequest({ fields: { password: 'WRONG_PASSWORD' } });
        }
    }

    async getBrandInfo(id: string, avatarUrlInfo?: any) {
        const brand = await this._brandModel.findById(id);

        if (brand) {
            brand.password = '';

            let brandRole = await this._role.findOne({ name: 'Brand' });

            if (!brandRole) throw new InternalError('BRAND_ROLE_NOT_FOUND');

            let permissions = await this._service.getRouteListByRoles([brandRole.id]);

            if (avatarUrlInfo) {
                brand.avatar_url = avatarUrlInfo.baseUrl + brand.id + avatarUrlInfo.path;
            }

            return { info: brand, permissions: permissions };
        } else {
            throw new BadRequest('BRAND_NOT_FOUND');
        }
    }

    /**
     * Request reset password
     * @param {string} email - Email of brand request reset password
     *
     * @return {Object} - Status of sending reset password email
     */
    async requestResetPassword(email: string) {
        let brand = await this._brandModel.findByEmail(email);

        if (!brand) throw new NotFound('BRAND_NOT_FOUND');

        if (brand.is_disabled) throw new Forbidden('BRAND_IS_DISABLED');

        brand.reset_password = {
            token: generateResetPasswordToken(brand._id),
            status: 1
        };

        return this._mongo.transaction(async session => {
            await brand!.save({ session });

            await this._mail.send(MailType.BRAND_FORGOT_PASSWORD, brand!.email, brand!.name, {
                token: brand!.reset_password.token
            });

            return { message: 'Reset password email is sent.' };
        });
    }

    /**
     * Check reset password token valid
     *
     * @param {string} email - Email need reset password
     * @param {string} token - Reset password token that needed to verify
     *
     * @return {Object} verify token is valid
     */
    async getResetPasswordTokenInfo(email: string, token: string) {
        let brand = await this._brandModel
            .findOne({ email, 'reset_password.token': token, 'reset_password.status': 1 })
            .select('email');

        if (!brand) throw new NotFound('RESET_PASSWORD_TOKEN_INVALID');

        return { message: 'Token is valid' };
    }

    /**
     * Reset password
     *
     * @param {string} email - Email need reset password
     * @param {string} token - Reset password token that needed to verify
     * @param {string} newPassword - New password
     *
     * @return {Object} verify reset password successful
     */
    async resetPassword(email: string, token: string, newPassword: string) {
        let brand = await this._brandModel
            .findOne({ email, 'reset_password.token': token, 'reset_password.status': 1 })
            .select('email reset_password');

        if (!brand) throw new NotFound('RESET_PASSWORD_TOKEN_INVALID');

        newPassword = Security.hash(this._config.security.pepper + newPassword);
        brand.password = newPassword;
        brand.reset_password = { token: '', status: 0 };

        await brand.save();

        return { message: 'Password has been resetted' };
    }
}
