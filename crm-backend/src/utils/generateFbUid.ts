import crypto from 'crypto';

export const generateFbUid = (): string => {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `FB-${randomHex}`;
};