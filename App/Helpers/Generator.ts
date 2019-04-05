export function generateUserCode(prefix: string, length: number = 5) {
    return prefix + '-' + generateRandomString('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', length);
}

function generateRandomString(
    possibility: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    length: number = 10
) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += possibility.charAt(Math.floor(Math.random() * possibility.length));
    }
    return result;
}
