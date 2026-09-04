import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const SSO_ORIGIN = process.env.SSO_ORIGIN || 'https://sso.doneisbetter.com';
const SESSION_COOKIE = 'deli-session';
const FLOW_COOKIE = 'deli-oauth-flow';
const SESSION_MAX_AGE = 60 * 60 * 8;

export function isAuthConfigured() {
  return Boolean(process.env.SSO_CLIENT_ID && process.env.SSO_CLIENT_SECRET);
}

function secret() {
  if (!process.env.SSO_CLIENT_SECRET) throw new Error('SSO_CLIENT_SECRET is not configured');
  return process.env.SSO_CLIENT_SECRET;
}

function sign(value) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

function seal(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

function unseal(value) {
  if (!value) return null;
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try { return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')); } catch { return null; }
}

function safeReturnTo(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export function createOAuthFlow(returnTo = '/') {
  const state = randomBytes(24).toString('base64url');
  const nonce = randomBytes(24).toString('base64url');
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { state, nonce, verifier, challenge, returnTo: safeReturnTo(returnTo), createdAt: Date.now() };
}

export function authorizationUrl(flow, redirectUri) {
  const clientId = process.env.SSO_CLIENT_ID;
  if (!clientId) throw new Error('SSO_CLIENT_ID is not configured');
  const url = new URL('/api/oauth/authorize', SSO_ORIGIN);
  url.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'openid profile email offline_access', state: flow.state, nonce: flow.nonce, code_challenge: flow.challenge, code_challenge_method: 'S256' }).toString();
  return url;
}

export async function saveOAuthFlow(flow) {
  const store = await cookies();
  store.set(FLOW_COOKIE, seal(flow), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 });
}

export async function completeOAuth(request, redirectUri) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const store = await cookies();
  const flow = unseal(store.get(FLOW_COOKIE)?.value);
  store.delete(FLOW_COOKIE);
  if (!code || !state || !flow || flow.state !== state || Date.now() - flow.createdAt > 600000) throw new Error('Invalid or expired OAuth state');

  const tokenResponse = await fetch(new URL('/api/oauth/token', SSO_ORIGIN), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ grant_type: 'authorization_code', code, client_id: process.env.SSO_CLIENT_ID, client_secret: secret(), redirect_uri: redirectUri, code_verifier: flow.verifier }), cache: 'no-store' });
  if (!tokenResponse.ok) throw new Error('OAuth code exchange failed');
  const tokens = await tokenResponse.json();
  if (!tokens.access_token) throw new Error('OAuth response did not include an access token');

  const userResponse = await fetch(new URL('/api/oauth/userinfo', SSO_ORIGIN), { headers: { authorization: `Bearer ${tokens.access_token}` }, cache: 'no-store' });
  if (!userResponse.ok) throw new Error('Unable to load SSO identity');
  const user = await userResponse.json();
  if (!user.sub) throw new Error('SSO identity is missing a subject');

  const permissionResponse = await fetch(new URL(`/api/users/${encodeURIComponent(user.sub)}/apps/${encodeURIComponent(process.env.SSO_CLIENT_ID)}/permissions`, SSO_ORIGIN), { headers: { authorization: `Bearer ${tokens.access_token}` }, cache: 'no-store' });
  const permission = permissionResponse.ok ? await permissionResponse.json() : null;
  const session = { user: { id: user.sub, email: user.email || '', name: user.name || user.email || 'Vásárló' }, permission: { status: permission?.status || 'unknown', role: permission?.role || user.role || 'user' }, expiresAt: Date.now() + SESSION_MAX_AGE * 1000 };
  store.set(SESSION_COOKIE, seal(session), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_MAX_AGE });
  return { session, returnTo: flow.returnTo };
}

export async function getSession() {
  try {
    const store = await cookies();
    const session = unseal(store.get(SESSION_COOKIE)?.value);
    return session?.expiresAt > Date.now() ? session : null;
  } catch { return null; }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export function getAppUrl(request) {
  return process.env.APP_URL || new URL(request.url).origin;
}
