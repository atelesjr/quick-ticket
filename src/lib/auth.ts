import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { logEvent } from '@/utils/sentry';

const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET_KEY);
const cookieName = 'auth_token';

// to encrypt and sign token'
type Payload = {
  userId: string;
}
export async function signAuthToken(payload: Payload) {
  try {
    const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

    return token; 

  } catch (error) {
    logEvent(
      'Token signing failed', 
      'auth', 
      {payload}, 
      'error', 
      error
    );

    throw new Error('Failed to sign auth token');
  };
};

//decrypt and verify token
export async function verifyAuthToken<T>(token: string): Promise<T> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return payload as T;

  } catch (error) {
    logEvent(
      'Token decryption failed', 
      'auth',
       {tokenSnippet: token.slice(0, 10)}, 
       'error', 
       error
      );

    throw new Error('Token decryption failed');
  };
};

// set auth token in cookies
export async function setAuthCookie(token: string) {
 try{
  const cookieStore = await cookies();
  
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

 } catch (error) {
   logEvent(
     'Failed to set auth cookie',
     'auth',
     { token },
     'error',
     error
   );
 };
};

/// Get auth token from cookies
export async function getAuthCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName);
  return token?.value;
};

// remove auth token from cookies
export async function removeAuthCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(cookieName);
  } catch (error) {
    logEvent(
      'Failed to remove auth cookie',
      'auth',
      {},
      'error',
      error
    );
  };
};
