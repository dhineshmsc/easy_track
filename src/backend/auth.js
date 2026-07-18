import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '9b72445e90a59f5a77f3e8f85b881333d8a6e8b248a313a48e718bcbd91a0c4f';
const JWT_EXPIRE_MINUTES = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES || '30', 10);

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(plain, hashed) {
  try {
    return bcrypt.compareSync(plain, hashed);
  } catch (e) {
    // Fallback for plain-text passwords if any exist in the legacy DB
    return plain === hashed;
  }
}

export function createAccessToken(data) {
  return jwt.sign(data, JWT_SECRET_KEY, {
    expiresIn: `${JWT_EXPIRE_MINUTES}m`
  });
}
