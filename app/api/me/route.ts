import { requireUserId } from '@/lib/auth/requireUserId';
import client from '@/lib/db';
import { HttpError } from '@/lib/error';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

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
