import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  // @NOTE: This is a workaround for the issue where NextAuth.js error "UntrustedHost"
  // Read more at https://errors.authjs.dev#untrustedhost
  trustHost: true,
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {},
} satisfies NextAuthConfig;
