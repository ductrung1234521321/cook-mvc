import crypto from "crypto";

export function generateRefreshToken(){
    return crypto.randomBytes(48).toString('hex');
}
export function hashToken(token){
    return crypto.createHash('sha256').update(token).digest('hex');
}
export function plusDays(date, days){
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}