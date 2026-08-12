import { requireUserId } from '@/lib/auth/requireUserId';
import dbConnect from '@/lib/dbConnect';
import { HttpError } from '@/lib/error';
import QuestionModel from '@/models/question';
import { Types } from 'mongoose';
import { NextResponse } from 'next/server';

type RouteParams = {
  params: Promise<{ questionId: string }>;
};

// PUT /api/questions/[questionId]/bookmark
// - 특정 질문의 북마크 상태를 변경하는 핸들러
export async function PUT(req: Request, { params }: RouteParams) {
  const { questionId } = await params;

  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error(
      `PATCH /api/questions/${questionId} unexpected error in requireUserId`,
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

  // 요청 바디 파싱 및 유효성 검사
  let body: unknown;

  try {
    body = await req.json();
  } catch (err) {
    console.error(
      `PATCH /api/questions/${questionId} failed to parse JSON body`,
      err,
    );

    return NextResponse.json(
      { error: '잘못된 요청 본문입니다.' },
      { status: 400 },
    );
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const { isBookmarked } = body as { isBookmarked?: unknown };

  if (typeof isBookmarked !== 'boolean') {
    return NextResponse.json(
      { error: 'isBookmarked는 boolean 값이어야 합니다.' },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    // 현재 사용자의 질문인지 확인하며 북마크 상태 업데이트
    const updatedQuestion = await QuestionModel.findOneAndUpdate(
      { _id: questionId, userId },
      { isBookmarked },
      { returnDocument: 'after' },
    );

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: '해당 질문을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(`PATCH /api/questions/${questionId} db error`, err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
