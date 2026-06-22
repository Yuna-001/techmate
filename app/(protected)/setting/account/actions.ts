'use server';

import { requireUserId } from '@/lib/auth/requireUserId';
import client from '@/lib/db';
import type { AccountProvider } from '@/types/account';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

type PrepareLinkProviderResult =
  | { ok: true }
  | { ok: false; error: 'SessionRequired' | 'InvalidProvider' | 'Unknown' };

type PendingLinkDoc = {
  token: string;
  provider: AccountProvider;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
};

const ALLOWED_PROVIDERS: AccountProvider[] = ['google', 'github'];
const ACCOUNT_LINK_TOKEN_COOKIE = 'account_link_token';
const LINK_TOKEN_MAX_AGE_SECONDS = 60 * 10;

const isAccountProvider = (provider: string): provider is AccountProvider =>
  ALLOWED_PROVIDERS.includes(provider as AccountProvider);

export const prepareLinkProvider = async (
  provider: string,
): Promise<PrepareLinkProviderResult> => {
  if (!isAccountProvider(provider)) {
    return { ok: false, error: 'InvalidProvider' };
  }

  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch {
    return { ok: false, error: 'SessionRequired' };
  }

  try {
    const now = new Date();
    const token = crypto.randomUUID();
    const db = client.db();
    const pendingLinks = db.collection<PendingLinkDoc>('pendingLinks');
    const userObjectId = new ObjectId(userId);

    await pendingLinks.deleteMany({
      userId: userObjectId,
      provider,
    });

    await pendingLinks.insertOne({
      token,
      provider,
      userId: userObjectId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + LINK_TOKEN_MAX_AGE_SECONDS * 1000),
    });

    const cookieStore = await cookies();

    cookieStore.set(ACCOUNT_LINK_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: LINK_TOKEN_MAX_AGE_SECONDS,
    });

    return { ok: true };
  } catch {
    return { ok: false, error: 'Unknown' };
  }
};
