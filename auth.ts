import authConfig from '@/auth.config';
import { authAdapter } from '@/lib/auth/adapter';
import client from '@/lib/db';
import { getToken } from '@auth/core/jwt';
import { ObjectId } from 'mongodb';
import NextAuth from 'next-auth';
import { cookies, headers } from 'next/headers';

type PendingLinkDoc = {
  token: string;
  provider: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
};

type AccountDoc = {
  provider: string;
  providerAccountId: string;
  userId: ObjectId;
};

const ACCOUNT_LINK_TOKEN_COOKIE = 'account_link_token';

// 현재 세션 사용자 확인
const getCurrentSessionUserId = async () => {
  const headerStore = await headers();
  const token =
    (await getToken({
      req: { headers: headerStore },
      secret: process.env.AUTH_SECRET,
      secureCookie: false,
    })) ??
    (await getToken({
      req: { headers: headerStore },
      secret: process.env.AUTH_SECRET,
      secureCookie: true,
    }));

  if (!token?.sub || !authAdapter.getUser) {
    return null;
  }

  const user = await authAdapter.getUser(token.sub);

  return user?.id ?? null;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: authAdapter,
  ...authConfig,
  events: {
    async createUser({ user }) {
      const db = client.db();
      await db
        .collection('users')
        .updateOne(
          { _id: new ObjectId(user.id) },
          { $set: { createdAt: new Date() } },
        );
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account }) {
      // 비OAuth 로그인: 기존 NextAuth 처리를 유지한다.
      if (!account) {
        return true;
      }

      const cookieStore = await cookies();
      const linkToken = cookieStore.get(ACCOUNT_LINK_TOKEN_COOKIE)?.value;
      const currentSessionUserId = await getCurrentSessionUserId();

      if (!linkToken) {
        // Pending Link 없음: 로그인 중이면 검증되지 않은 연동 요청으로 본다.
        if (currentSessionUserId) {
          return '/setting/account?error=LinkRequired';
        }

        // 일반 로그인: 로그아웃 상태의 OAuth 요청은 기존 흐름을 따른다.
        return true;
      }

      const db = client.db();
      // Pending Link 검증: 재사용 방지를 위해 조회와 동시에 소비한다.
      const pendingLink = await db
        .collection<PendingLinkDoc>('pendingLinks')
        .findOneAndDelete({
          token: linkToken,
          provider: account.provider,
          expiresAt: { $gt: new Date() },
        });

      cookieStore.delete(ACCOUNT_LINK_TOKEN_COOKIE);

      // Pending Link 만료/무효: 다시 연동을 시작해야 한다.
      if (!pendingLink) {
        return '/setting/account?error=LinkExpired';
      }

      // 세션 소실: 연동 중 로그아웃되었으므로 재로그인이 필요하다.
      if (!currentSessionUserId) {
        return '/login?error=SessionRequired';
      }

      // 사용자 불일치: 연동 시작 사용자와 callback 세션 사용자가 다르다.
      if (pendingLink.userId.toString() !== currentSessionUserId) {
        return '/setting/account?error=LinkRequired';
      }

      // 계정 중복 확인
      const existingAccount = await db
        .collection<AccountDoc>('accounts')
        .findOne({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });

      // 미연동 계정: NextAuth 기본 linkAccount 흐름으로 연결한다.
      if (!existingAccount) {
        return true;
      }

      // 현재 계정에 이미 연결됨
      if (existingAccount.userId.toString() === currentSessionUserId) {
        return '/setting/account?error=AlreadyLinkedToCurrent';
      }

      // 다른 사용자에게 이미 연결됨
      return '/setting/account?error=AlreadyLinked';
    },
  },
});
