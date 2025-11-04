import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const ADMIN_EMAILS = (process.env.ADMIN_ALLOWED_EMAILS ?? '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt'
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
  ],
  callbacks: {
    async jwt({ token, profile }) {
      const email = (profile?.email ?? token.email ?? '').toString().toLowerCase();
      const role: 'admin' | 'contributor' | 'viewer' =
        email && ADMIN_EMAILS.includes(email) ? 'admin' : 'viewer';

      token.email = email || token.email;
      token.name = profile?.name ?? token.name;
      token.picture = (profile as any)?.picture ?? token.picture;
      token.role = role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string | undefined) ?? session.user.email ?? undefined;
        session.user.name = (token.name as string | undefined) ?? session.user.name ?? undefined;
        session.user.image = (token.picture as string | undefined) ?? session.user.image ?? undefined;
        session.user.role = (token.role as 'admin' | 'contributor' | 'viewer' | undefined) ?? 'viewer';
      }
      return session;
    }
  }
});
