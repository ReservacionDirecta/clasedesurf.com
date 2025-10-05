import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '/api';

export const authOptions = {
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
            backendTokenExpires: Date.now() + 15 * 60 * 1000, // match backend 15m access token
          };
        } catch (err) {
          console.error('Authorize error calling backend:', err);
          return null;
        }
      },
    }),
    // Add other providers like GoogleProvider, FacebookProvider here
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  callbacks: {
  async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        if ((user as any).backendToken) token.backendToken = (user as any).backendToken;
        if ((user as any).backendTokenExpires) token.backendTokenExpires = (user as any).backendTokenExpires;
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
            token.backendTokenExpires = Date.now() + 15 * 60 * 1000;
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
