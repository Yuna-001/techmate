import { authAdapter } from '@/lib/auth/adapter';
import { requireUserId } from '@/lib/auth/requireUserId';
import dbConnect from '@/lib/dbConnect';
import { HttpError } from '@/lib/error';
import AnswerModel from '@/models/answer';
import ProfileModel from '@/models/profile';
import QuestionModel from '@/models/question';
import mongoose from 'mongoose';
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
    if (!authAdapter.deleteUser) {
      console.error('authAdapter.deleteUser is not implemented');

      return NextResponse.json(
        { error: '서버 에러가 발생했습니다.' },
        { status: 500 },
      );
    }

    await dbConnect();

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await AnswerModel.deleteMany({ userId }).session(session);
        await QuestionModel.deleteMany({ userId }).session(session);
        await ProfileModel.deleteOne({ userId }).session(session);
      });
    } finally {
      await session.endSession();
    }

    await authAdapter.deleteUser(userId);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE /api/me unexpected error', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
