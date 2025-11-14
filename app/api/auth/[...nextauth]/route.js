import NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';

/**
 * NextAuth API route handler
 * Handles all auth endpoints: /api/auth/signin, /api/auth/signout, etc.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
