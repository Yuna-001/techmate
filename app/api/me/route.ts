import { requireUserId } from '@/lib/auth/requireUserId';
import client from '@/lib/db';
import { HttpError } from '@/lib/error';
import type { AccountProvider, AccountResponse } from '@/types/account';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

type UserAccountDoc = {
  createdAt: Date;
};

type AccountDoc = {
  provider: string;
};

const isAccountProvider = (provider: string): provider is AccountProvider => {
  return provider === 'github' || provider === 'google';
};

// GET /api/me
// - 사용자의 계정 정보(로그인 방식, 가입일)를 조회하는 핸들러
export async function GET() {
  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error('GET /api/me unexpected error in requireUserId', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  try {
    const mongoClient = await client.connect();
    const db = mongoClient.db();
    const userObjectId = new ObjectId(userId);

    const [user, account] = await Promise.all([
      db
        .collection<UserAccountDoc>('users')
        .findOne({ _id: userObjectId }, { projection: { createdAt: 1 } }),
      db
        .collection<AccountDoc>('accounts')
        .findOne({ userId: userObjectId }, { projection: { provider: 1 } }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    let provider: AccountProvider | null = null;

    if (account && isAccountProvider(account.provider)) {
      provider = account.provider;
    }

    return NextResponse.json<AccountResponse>({
      provider,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    console.error('GET /api/me db error', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// DELETE /api/me
// - 사용자의 계정을 삭제하는 핸들러
export async function DELETE() {
  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error('DELETE /api/me unexpected error in requireUserId', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  try {
    const mongoClient = await client.connect();
    const session = mongoClient.startSession();
    const userObjectId = new ObjectId(userId);

    try {
      await session.withTransaction(async () => {
        const db = mongoClient.db();

        await db
          .collection('answers')
          .deleteMany({ userId: userObjectId }, { session });
        await db
          .collection('questions')
          .deleteMany({ userId: userObjectId }, { session });
        await db
          .collection('profiles')
          .deleteOne({ userId: userObjectId }, { session });
        await db
          .collection('accounts')
          .deleteMany({ userId: userObjectId }, { session });
        await db
          .collection('users')
          .deleteOne({ _id: userObjectId }, { session });
      });
    } finally {
      await session.endSession();
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE /api/me db error', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
