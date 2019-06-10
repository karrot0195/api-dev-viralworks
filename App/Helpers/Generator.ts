import { Tag } from 'App/Modules/Admin/Enum/Default';
import { TokenStatus } from 'App/Models/KolUserModel';
import { Forbidden } from 'System/Error/Forbidden';
import * as Security from 'System/Helpers/Security';

export function generateUserCode(prefix: string, length: number = 5) {
    return prefix + '-' + generateRandomString('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', length);
}

export function generateRandomString(
    possibility: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    length: number = 10
) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += possibility.charAt(Math.floor(Math.random() * possibility.length));
    }
    return result;
}

export function getOptionsTag() {
    return [Tag.Red, Tag.Orange, Tag.Yellow, Tag.Green, Tag.Cyan, Tag.Blue, Tag.Purple, Tag.Gray, Tag.Black, Tag.White];
}

export async function generateSummaryInfo(kolUser: any) {
    let summary_info = '';

    if (kolUser.facebook) {
        summary_info += (kolUser.facebook.entity_id || '') + ' ';
        summary_info += (kolUser.facebook.name || '') + ' ';
        summary_info += (kolUser.facebook.profile_link || '') + ' ';
    }

    if (kolUser.kol_info) summary_info += (kolUser.kol_info.mobile || '') + ' ';

    summary_info += (kolUser.email || '') + ' ';
    summary_info += (kolUser.code || '') + ' ';

    kolUser.summary_info = summary_info.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function generateSlug(text: string, slugList: string[]): string {
    let slug = text
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[.,: ]+/g, '-')
        .replace(/[^a-zA-Z0-9-đ]+/g, '')
        .toLowerCase()
        .replace(/đ/g, 'd');

    while (slugList.indexOf(slug) !== -1) {
        slug += '-' + generateRandomString('abcdefghijklmnopqrstuvwxyz0123456789', 4);
    }

    return slug;
}

/**
 * Generate token for reset password feature
 *
 * @param {string} id - ObjectId of user
 *
 * @return {string} - Reset password token
 */
export function generateResetPasswordToken(id: string) {
    let surfix = generateRandomString('abcdef0123456789', 48);

    return surfix + id;
}

export function getLimitPricePayment() {
    return process.env.LIMIT_PRICE_PAYMENT || 100000;
}

export function excuteVi2En(text: string) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function getKeyFromText(key: string) {
    return excuteVi2En(key)
        .toLowerCase()
        .replace(/\ /g, '-');
}

export enum DebugType {
    Error = 1
}
export function showDebug(data: any, type: number=1) {
    if (type && type == DebugType.Error) {
        console.log(`\x1b[41m \x1b[37m ${data}\x1b[0m`);
    } else {
        console.log(data);
    }
}

export function generateTokenKol(token: any) {
    var isToken = false;
    if (token) {
        if (token['token'] && token['status'] == TokenStatus.Raw && token['created_at']) {
            const time = +new Date(token['created_at']) - +new Date();
            const rangeExpired = 5 * 60 * 60 * 1000; // 5 hours
            if (time < rangeExpired) {
                isToken = true;
            }
        }
    }

    if (isToken) {
        const spamTime = +new Date() - +new Date(token.updated_at);
        const rangSpam = 10 * 1000; // 1 mail / 10 sec
        if (spamTime < rangSpam) {
            throw new Forbidden('SPAM_EMAIL');
        }
        token.updated_at = new Date();
        return token;
    }

    return {
        token: Security.generatetoken(),
        status: TokenStatus.Raw,
        created_at: new Date(),
        updated_at: new Date()
    };
}
