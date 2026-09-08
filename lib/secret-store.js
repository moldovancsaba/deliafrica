import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

function key() {
  const source = process.env.SETTINGS_ENCRYPTION_KEY || process.env.SSO_CLIENT_SECRET;
  if (!source) throw new Error('SETTINGS_ENCRYPTION_KEY or SSO_CLIENT_SECRET is required for provider credentials');
  return createHash('sha256').update(source).digest();
}

export function encryptSecret(value) {
  if (!value) return '';
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptSecret(value) {
  if (!value) return '';
  const [ivPart, tagPart, dataPart] = String(value).split('.');
  if (!ivPart || !tagPart || !dataPart) return '';
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataPart, 'base64url')), decipher.final()]).toString('utf8');
}
