import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './dbConnect';
import User from '../models/User';

/**
 * NextAuth configuration options
 * Handles authentication with JWT tokens and role-based access
 */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        try {
          const conn = await dbConnect();
          
          if (!conn) {
            throw new Error('Database connection not available');
          }

          // Find user by email
          const user = await User.findOne({ email: credentials.email.toLowerCase() });

          if (!user) {
            throw new Error('No user found with this email');
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated. Please contact support');
          }

          // Check if passwordHash exists
          if (!user.passwordHash) {
            console.error('User found but passwordHash is missing:', user.email);
            throw new Error('Account setup incomplete. Please reset your password');
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValidPassword) {
            throw new Error('Invalid password');
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          // Return user object (will be stored in JWT)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            farmerProfile: user.farmerProfile?.toString(),
            buyerProfile: user.buyerProfile?.toString(),
            cooperativeId: user.cooperativeId?.toString(),
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  
  callbacks: {
    /**
     * JWT callback - runs when JWT is created or updated
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.farmerProfile = user.farmerProfile;
        token.buyerProfile = user.buyerProfile;
        token.cooperativeId = user.cooperativeId;
      }

      // Update token on session update
      if (trigger === 'update' && session) {
        token.name = session.name || token.name;
        token.email = session.email || token.email;
      }

      return token;
    },

    /**
     * Session callback - runs when session is checked
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.farmerProfile = token.farmerProfile;
        session.user.buyerProfile = token.buyerProfile;
        session.user.cooperativeId = token.cooperativeId;
      }
      return session;
    },

    /**
     * Redirect callback - handles redirects after sign in
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/auth/signup',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build-only',

  debug: process.env.NODE_ENV === 'development',
};
