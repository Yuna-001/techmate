import client from '@/lib/db';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import type { Adapter } from 'next-auth/adapters';

export const authAdapter = MongoDBAdapter(client) as Adapter;
