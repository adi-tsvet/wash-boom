import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: number; // Ensure 'id' is a number
    username: string;
    admin: True | False;
    name: string;
    dateJoined: string;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    id: number; // Add 'id' to the JWT type
  }
}
