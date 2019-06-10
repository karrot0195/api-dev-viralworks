export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateJobId(email: string, emailType: number) {
    return email + '|' + emailType;
}
