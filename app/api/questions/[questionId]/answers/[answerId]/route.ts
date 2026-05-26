import { requireUserId } from '@/lib/auth/requireUserId';
import dbConnect from '@/lib/dbConnect';
import { HttpError } from '@/lib/error';
import AnswerModel from '@/models/answer';
import type { AnswerDetailResponse } from '@/types/answer';
import { Types } from 'mongoose';
import { NextResponse } from 'next/server';

type RouteParams = {
  params: Promise<{ questionId: string; answerId: string }>;
};

// GET /api/questions/[questionId]/answers/[answerId]
// - 특정 답변과 그에 대한 피드백을 조회하는 핸들러
export async function GET(_req: Request, { params }: RouteParams) {
  const { questionId, answerId } = await params;

  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error(
      `GET /api/questions/${questionId}/answers/${answerId} unexpected error in requireUserId`,
      err,
    );

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  if (!Types.ObjectId.isValid(questionId)) {
    return NextResponse.json(
      { error: '잘못된 질문 ID입니다.' },
      { status: 400 },
    );
  }

  if (!Types.ObjectId.isValid(answerId)) {
    return NextResponse.json(
      { error: '잘못된 답변 ID입니다.' },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    const answer = await AnswerModel.findOne(
      { _id: answerId, userId, questionId },
      { _id: 0, content: 1, feedback: 1 },
    ).lean<AnswerDetailResponse | null>();

    if (!answer) {
      return NextResponse.json(
        { error: '해당 답변을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const response: AnswerDetailResponse = {
      ...answer,
    };

    return NextResponse.json<AnswerDetailResponse>(response, { status: 200 });
  } catch (err) {
    console.error(
      `GET /api/questions/${questionId}/answers/${answerId} db error`,
      err,
    );

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// DELETE /api/questions/[questionId]/answers/[answerId]
// - 특정 답변을 삭제하는 핸들러
export async function DELETE(_req: Request, { params }: RouteParams) {
  const { questionId, answerId } = await params;

  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error(
      `DELETE /api/questions/${questionId}/answers/${answerId} unexpected error in requireUserId`,
      err,
    );

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  if (!Types.ObjectId.isValid(questionId)) {
    return NextResponse.json(
      { error: '잘못된 질문 ID입니다.' },
      { status: 400 },
    );
  }

  if (!Types.ObjectId.isValid(answerId)) {
    return NextResponse.json(
      { error: '잘못된 답변 ID입니다.' },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    const deleteResult = await AnswerModel.deleteOne({
      _id: answerId,
      userId,
      questionId,
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: '해당 답변을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(
      `DELETE /api/questions/${questionId}/answers/${answerId} db error`,
      err,
    );

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
