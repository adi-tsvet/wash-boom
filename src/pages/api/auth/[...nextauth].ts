// pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../models/User';

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error('Username or password missing.');
          throw new Error('Missing username or password');
        }

        // Connect to the database
        await dbConnect();

        try {
          // Find user in MongoDB
          const user = await User.findOne({ username: credentials.username });
          if (!user) {
            console.error('User not found.');
            throw new Error('No user found');
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.error('Invalid password.');
            throw new Error('Invalid credentials');
          }

          console.log(user._id.toString())
          // User authorized
          return {
            id: user._id.toString(),
            username: user.username,
            name: user.name,
            adminFlag: user.adminFlag,
            dateJoined: user.dateJoined,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw new Error('Authorization failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Explicitly type token properties
      if (user) {
        token.id = user.id as string;
        token.username = user.username as string;
        token.adminFlag = user.adminFlag as boolean;
        token.name = user.name as string;
        token.dateJoined = user.dateJoined as Date;
      }
      return token;
    },
    async session({ session, token }) {
      // Add the token data to the session
      session.user = {
        id: token.id as string,
        username: token.username as string,
        adminFlag: token.adminFlag as boolean,
        name: token.name as string,
        dateJoined: token.dateJoined as Date,
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
});
