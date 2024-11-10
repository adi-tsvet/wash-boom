
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import sqlite3 from 'better-sqlite3';

const db = new sqlite3('./database.db');

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
          throw new Error('Missing username or password');
        }

        const { username, password } = credentials;

        // Fetch user from the database
        const user = db
          .prepare('SELECT id, username, password, admin_flag, name, date_joined FROM users WHERE username = ?')
          .get(username);

        if (!user) throw new Error('No user found');

        // Check if the provided password matches the hashed password in the database
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error('Invalid credentials');

        // Return essential user info, adding any additional data we want in the JWT and session
        return { 
          id: user.id,
          username: user.username,
          name: user.name,
          admin: user.admin_flag,
          dateJoined: user.date_joined
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user information to the token on initial login
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.admin = user.admin;
        token.name = user.name;
        token.dateJoined = user.dateJoined;
      }
      return token;
    },
    async session({ session, token }) {
      // Add the token data to the session
      session.user = {
        ...session.user,
        id: token.id as number,
        username: token.username as string,
        name: token.name as string,
        admin: token.admin as boolean,
        dateJoined: token.dateJoined as string,
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut:'/login',
  },
});
