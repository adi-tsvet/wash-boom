// next-auth.d.ts

import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    adminFlag: boolean;
    name: string;
    dateJoined: Date;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    id: string;
    username: string;
    adminFlag: boolean;
    name: string;
    dateJoined: Date;
  }
}
