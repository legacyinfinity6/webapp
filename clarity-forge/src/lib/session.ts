import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(sessionCookie, secret);
    return payload as { userId: string; email: string; iat: number; exp: number };
  } catch (error) {
    return null;
  }
}
