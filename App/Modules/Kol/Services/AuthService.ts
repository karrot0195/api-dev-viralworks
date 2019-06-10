import { Injectable } from 'System/Injectable';
import * as Security from 'System/Helpers/Security';
import { BadRequest } from 'System/Error/BadRequest';
import { NotFound } from 'System/Error/NotFound';
import { Config } from 'System/Config';
import { Mongo } from 'System/Mongo';
import { KolUserModel, TokenStatus } from 'App/Models/KolUserModel';
import { RoleModel } from 'System/RBAC/Models/RoleModel';
import { Forbidden } from 'System/Error/Forbidden';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { MailService } from 'App/Modules/Admin/Services/MailService';
import * as _ from 'lodash';
import { generateTokenKol } from 'App/Helpers/Generator';
import { MailType } from 'App/Models/MailModel';
export const TYPE_AUTH = 'kol-user';

@Injectable
export class AuthService {
    constructor(private _config: Config, private _mongo: Mongo, private _kolUserModel: KolUserModel, private _roleModel: RoleModel, private mailService: MailService) {}

    async login(email: string, password: string, remember: number = 0) {
        let user = await this.findKolUserByEmail(email);
        if (!user) throw new NotFound('USER_NOT_FOUND');

        const role = await this._roleModel.findOne({name: 'Kol'});
        if (!role) throw new Forbidden('ROLE_NOT_FOUND');
        if (user && Security.compare(this._config.security.pepper + password, user.password)) {
            let expire: string = this._config.jwt.expire;
            if (remember == 1) expire = this._config.jwt.remember;

            // make jwt token
            let token = Security.signToken(
                { id: user.id, name: user.facebook['name'], type: TYPE_AUTH, roles: [ role._id ] },
                this._config.jwt.key,
                expire
            );
            delete user['password'];
            return { info: user, token: token };
        } else {
            throw new BadRequest({ fields: { password: 'WRONG_PASSWORD' } });
        }
    }

    public async findKolUserById(id: string, select: Array<string>) {
        return this._kolUserModel.findById(id).select(select);
    }

    public async findKolUserByEmail(email: string) {
        return this._kolUserModel.findOne({email: email}).select(['email', 'facebook.name', 'password', 'token.email.status']);
    }

    public async changePassword(kId: string, current_password: string, new_password: string) {
        const kol = <KolUser>await this._kolUserModel.findById(kId);
        if (!kol) throw new NotFound('KOL_NOT_FOUND');
        if (Security.compare(this._config.security.pepper + current_password, kol.password)) {
            kol.password = Security.hash(this._config.security.pepper + new_password);
            if (await kol.save()) {
                return true;
            }
            return false;
        } else {
            throw new BadRequest({
                fields: {
                    current_password: 'PASSWORD_NOT_MATCH'
                }
            })
        }
    }

    public async changePasswordbyToken(token: string, new_password: string) {
        const kol = <KolUser>await this._kolUserModel.findOne({"$and": [
                {"token.password.status": TokenStatus.Raw},
                {"token.password.token": token}
            ] });
        if (!kol) throw new Forbidden('TOKEN_EXPIRED');
        kol.password = Security.hash(this._config.security.pepper + new_password);
        kol.token.password['status'] = TokenStatus.Accept;
        await kol.save();
        return true;
    }

    public async sendMailForgotPassword(email: string) {
        const kol = await this._kolUserModel.findOne({email: email});
        if (!kol) throw new NotFound('KOL_NOT_FOUND');
        var tokenPassword: object = _.get(kol, 'token.password');
        const token = generateTokenKol(tokenPassword);
        return this._mongo.transaction(async session =>  {
            kol.token.password = token;
            await this.mailService.excuteSendMailKol(kol.id, kol._id, MailType.KOL_FORGOT_PASSWORD, {
                token: token.token
            }, session);
            await kol.save({ session });
            return true;
        });
    }

    public async sendMailVerify(email: string) {
        const kol = await this._kolUserModel.findOne({email: email});
        const status = _.get(kol, 'token.email.status');
        if (status == TokenStatus.Accept) {
            throw new Forbidden('KOL_EMAIL_VERIFY');
        }

        if (!kol) throw new NotFound('KOL_NOT_FOUND');
        var tokenEmail: object = _.get(kol, 'token.email');
        const token = generateTokenKol(tokenEmail);
        return this._mongo.transaction(async session =>  {
            kol.token.email = token;
            await this.mailService.excuteSendMailKol(kol.id, kol._id, MailType.KOL_VERIFY_EMAIL, {
                token: token.token
            }, session);
            await kol.save({ session });
            return true;
        });
    }

    public async verifyEmail(token: string) {
        const kol = <KolUser>await this._kolUserModel.findOne({"$and": [
                {"token.email.status": TokenStatus.Raw},
                {"token.email.token": token}
            ] });
        if (!kol) throw new Forbidden('TOKEN_EXPIRED');
        kol.token.email['status'] = TokenStatus.Accept;
        await kol.save();
        return true;
    }
}