import '@auth/core/adapters';
import { type DefaultSession } from 'next-auth';
import 'next-auth/adapters';

declare module 'next-auth' {
  interface Session {
    user: {
      userId: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/adapters' {
  interface AdapterUser {
    createdAt?: Date | null;
  }
}

export {};
