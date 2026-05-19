import { generateFeedback } from '@/lib/ai/feedback';
import { requireUserId } from '@/lib/auth/requireUserId';
import { MAX_ANSWER_LENGTH } from '@/lib/constants/answer';
import dbConnect from '@/lib/dbConnect';
import { HttpError } from '@/lib/error';
import AnswerModel from '@/models/answer';
import QuestionModel from '@/models/question';
import { Types } from 'mongoose';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface RouteParams {
  params: Promise<{ questionId: string }>;
}

// POST /api/questions/[questionId]/answers
// - 사용자의 답변을 저장하고 OpenAI로부터 피드백을 생성·저장한 뒤 answerId를 반환하는 핸들러
export async function POST(req: Request, { params }: RouteParams) {
  const { questionId } = await params;

  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error(
      `POST /api/questions/${questionId}/answers unexpected error in requireUserId`,
      err,
    );

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  // questionId 유효성 검사
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
      `POST /api/questions/${questionId}/answers failed to parse JSON body`,
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

  const { answer } = body as { answer?: unknown };

  if (typeof answer !== 'string') {
    return NextResponse.json(
      { error: '사용자 답변은 문자열이어야 합니다.' },
      { status: 400 },
    );
  }

  const trimmedAnswer = answer.trim();

  if (trimmedAnswer.length === 0) {
    return NextResponse.json(
      { error: '사용자 답변은 비어 있을 수 없습니다.' },
      { status: 400 },
    );
  }

  if (trimmedAnswer.length > MAX_ANSWER_LENGTH) {
    return NextResponse.json(
      { error: `사용자 답변은 ${MAX_ANSWER_LENGTH}자 이내여야 합니다.` },
      { status: 400 },
    );
  }

  let question: { content: string; idealAnswer: string } | null;

  try {
    await dbConnect();

    // 질문을 조회하여 질문 내용과 이상적 답안 확인
    question = await QuestionModel.findOne(
      { _id: questionId, userId },
      { content: 1, idealAnswer: 1 },
    ).lean<{ content: string; idealAnswer: string } | null>();
  } catch (err) {
    console.error(`POST /api/questions/${questionId}/answers db error`, err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  if (!question) {
    return NextResponse.json(
      { error: '해당 질문을 찾을 수 없습니다.' },
      { status: 404 },
    );
  }

  let feedback: Awaited<ReturnType<typeof generateFeedback>>;

  try {
    feedback = await generateFeedback({
      question: question.content,
      idealAnswer: question.idealAnswer,
      answer,
    });
  } catch (err) {
    // OpenAI API에서 에러 응답이 온 경우
    if (err instanceof OpenAI.APIError) {
      const status = err.status ?? 500;

      console.error(
        `POST /api/questions/${questionId}/answers OpenAI APIError`,
        { status, name: err.name, requestID: err.requestID },
        err,
      );

      if (status === 429) {
        return NextResponse.json(
          {
            error:
              '요청이 많아 피드백 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
          },
          { status: 429 },
        );
      }

      // OpenAI 서버 장애/일시 오류
      if (status >= 500) {
        return NextResponse.json(
          {
            error: 'OpenAI 서비스가 불안정합니다. 잠시 후 다시 시도해 주세요.',
          },
          { status: 503 },
        );
      }

      // 요청 자체가 문제(프롬프트/입력)인 경우
      if (status === 400 || status === 422) {
        return NextResponse.json(
          { error: '피드백 생성 요청이 올바르지 않습니다.' },
          { status: 400 },
        );
      }

      // 그 외는 일반 실패로 처리
      return NextResponse.json(
        { error: '피드백 생성에 실패했습니다.' },
        { status: 500 },
      );
    }

    // OpenAI 서버와의 네트워크/연결 문제
    if (
      err instanceof OpenAI.APIConnectionError ||
      err instanceof OpenAI.APIConnectionTimeoutError
    ) {
      console.error(
        `POST /api/questions/${questionId}/answers OpenAI connection error`,
        err,
      );

      return NextResponse.json(
        {
          error:
            'OpenAI 서비스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        },
        { status: 503 },
      );
    }

    // 피드백 파싱/검증 로직에서 명시적으로 던진 에러
    if (err instanceof Error) {
      if (
        err.message === '피드백 생성에 실패했습니다.' ||
        err.message === '생성된 응답 형식이 올바르지 않습니다.'
      ) {
        console.error(
          `POST /api/questions/${questionId}/answers feedback logic error`,
          err,
        );

        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    console.error(
      `POST /api/questions/${questionId}/answers unexpected error`,
      err,
    );

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  try {
    const { _id } = await AnswerModel.create({
      userId,
      questionId,
      content: trimmedAnswer,
      feedback,
    });

    // 질문의 lastActivityAt 필드 업데이트
    await QuestionModel.updateOne(
      { _id: questionId, userId },
      { $currentDate: { lastActivityAt: true } },
    );

    const answerId = _id.toString();

    return NextResponse.json({ answerId }, { status: 201 });
  } catch (err) {
    console.error(`POST /api/questions/${questionId}/answers db error`, err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
