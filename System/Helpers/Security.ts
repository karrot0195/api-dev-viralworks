import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export function hash(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function compare(password: string, hashed: string) {
    return bcrypt.compareSync(password, hashed);
}

export function signToken(payload: any, secretKey: string, expiresIn: string) {
    const key = Buffer.from(secretKey, 'base64');
    return jwt.sign(payload, key, { expiresIn });
}

export function decodeToken(token: string) {
    return jwt.decode(token);
}

export function generatetoken() {
    return crypto.randomBytes(6).toString('hex');
}