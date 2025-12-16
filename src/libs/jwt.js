import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '15m';

export function signAccessToken(user){
    return jwt.sign({sub: user.id, role: user.role, avatarId: user.avatarId}, JWT_SECRET, {expiresIn: JWT_EXPIRES});
}

export function verifyAccessToken(token){
    return jwt.verify(token, JWT_SECRET);
}