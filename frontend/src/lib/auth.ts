import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types';
import { cookies } from 'next/headers';

// Use same logic as next.config.js - force localhost:4000 in development
// In server-side code (NextAuth), we need the full URL, not the proxy path
const BACKEND_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '/api');

// Force the correct URL for NextAuth in production
const NEXTAUTH_URL = process.env.NODE_ENV === 'production'
  ? 'https://clasedesurf.com'
  : process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const authOptions = {
  trustHost: true, // Trust the host header from the proxy
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const payloadBody = { email: credentials.email, password: credentials.password };
          console.log('[nextauth] authorize -> POST', `${BACKEND_URL}/auth/login`, payloadBody);
          const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadBody),
          });
          if (!res.ok) {
            const text = await res.text();
            console.error('[nextauth] Backend /auth/login error', res.status, text);
            // Throwing an Error here makes NextAuth return the message in signIn result.error
            throw new Error(text || 'Invalid credentials');
          }
          const payload = await res.json();
          const user = payload.user;
          const token = payload.token;
          if (!user) return null;
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            backendToken: token,
            backendTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // match backend 24h access token
          };
        } catch (err) {
          console.error('Authorize error calling backend:', err);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      // Si es autenticación con Google, crear/actualizar usuario en backend
      if (account?.provider === 'google') {
        try {
          const backendUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:4000'
            : (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/api');

          // Get role from cookie if available (set during registration)
          const cookieStore = await cookies();
          const roleCookie = cookieStore.get('registration_role');
          const role = roleCookie?.value;

          // Llamar al backend para crear/obtener usuario
          const response = await fetch(`${backendUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: account.providerAccountId,
              email: user.email,
              name: user.name,
              image: user.image,
              role: role // Pass the role to the backend
            })
          });

          if (response.ok) {
            const data = await response.json();
            // Agregar datos del backend al user object
            user.id = data.user.id.toString();
            user.role = data.user.role;
            (user as any).backendToken = data.token;
            (user as any).backendTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
          } else {
            console.error('Error en autenticación Google con backend:', await response.text());
            return false; // Rechazar el sign in si falla
          }
        } catch (error) {
          console.error('Error en signIn callback para Google:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        if ((user as any).backendToken) token.backendToken = (user as any).backendToken;
        if ((user as any).backendTokenExpires) token.backendTokenExpires = (user as any).backendTokenExpires;
      }

      // Si es login con Google y no tenemos backendToken, intentar obtenerlo
      if (account?.provider === 'google' && !token.backendToken) {
        try {
          const backendUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:4000'
            : (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/api');

          const response = await fetch(`${backendUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: account.providerAccountId,
              email: token.email,
              name: token.name
            })
          });

          if (response.ok) {
            const data = await response.json();
            token.backendToken = data.token;
            token.backendTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
            token.id = data.user.id.toString();
            token.role = data.user.role;
          }
        } catch (error) {
          console.error('Error obteniendo backend token para Google:', error);
        }
      }

      // If token exists and not expired, return
      const expires = token.backendTokenExpires as number | undefined;
      if (token.backendToken && expires && Date.now() < expires) return token;

      // Otherwise attempt to refresh via backend
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '/api'}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // send cookie
        });
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            token.backendToken = data.token;
            token.backendTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
          }
        }
      } catch (err) {
        console.error('Refresh failed', err);
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        // expose backend token on session for client-side calls if needed
        (session as any).backendToken = (token as any).backendToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.clasedesurf.com' : undefined,
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    }
  }
};

export default NextAuth(authOptions);

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
