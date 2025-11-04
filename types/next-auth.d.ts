import 'next-auth';
import 'next-auth/jwt';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string;
      role?: 'admin' | 'contributor' | 'viewer';
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'admin' | 'contributor' | 'viewer';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'contributor' | 'viewer';
  }
}
