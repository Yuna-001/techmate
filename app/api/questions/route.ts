import { createQuestionResponse } from '@/lib/ai/question';
import { requireUserId } from '@/lib/auth/requireUserId';
import dbConnect from '@/lib/dbConnect';
import { HttpError } from '@/lib/error';
import ProfileModel from '@/models/profile';
import QuestionModel from '@/models/question';
import type { ProfileDoc } from '@/types/profile';
import { Types } from 'mongoose';
import { NextResponse } from 'next/server';

interface QuestionCommonFields {
  content: string;
  isBookmarked: boolean;
  tags: string[];
}

interface QuestionDoc extends QuestionCommonFields {
  _id: Types.ObjectId;
  createdAt: Date;
}

interface QuestionListItem extends QuestionCommonFields {
  questionId: string;
  createdAt: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

// GET /api/questions
// - 질문 목록을 조회하는 핸들러 (페이지네이션, 북마크 필터 지원)
export async function GET(req: Request) {
  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error('GET /api/questions unexpected error in requireUserId', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  // 페이지네이션 / 필터 쿼리 파라미터 파싱 및 보정
  const { searchParams } = new URL(req.url);

  // page: 숫자가 아니면 기본값, 1보다 작으면 1로 보정
  const pageParam = Number(searchParams.get('page'));
  const rawPage = Number.isFinite(pageParam)
    ? Math.floor(pageParam)
    : DEFAULT_PAGE;
  const page = Math.max(DEFAULT_PAGE, rawPage);

  // limit(한 페이지당 질문 개수): 숫자가 아니면 기본값, 1보다 작으면 기본값, 최대 MAX_LIMIT까지만 허용
  const limitParam = Number(searchParams.get('limit'));
  const rawLimit = Number.isFinite(limitParam) ? limitParam : DEFAULT_LIMIT;
  const baseLimit = rawLimit > 0 ? Math.floor(rawLimit) : DEFAULT_LIMIT;
  const limit = Math.min(Math.max(baseLimit, 1), MAX_LIMIT);

  // isBookmarkedFilter: 'true' | 'false'일 때만 필터로 사용, 그 외에는 필터 미적용
  const isBookmarkedParam = searchParams.get('isBookmarked');
  const isBookmarkedFilter: boolean | null =
    isBookmarkedParam === 'true'
      ? true
      : isBookmarkedParam === 'false'
        ? false
        : null;

  // DB 조회에 사용할 필터 구성
  const filter: { userId: Types.ObjectId; isBookmarked?: boolean } = {
    userId: new Types.ObjectId(userId),
  };

  if (isBookmarkedFilter !== null) {
    filter.isBookmarked = isBookmarkedFilter;
  }

  try {
    await dbConnect();

    // 전체 질문 개수 조회 후, 요청 페이지가 범위를 벗어나면 마지막 페이지로 보정
    const totalCount = await QuestionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage =
      totalPages > 0 ? Math.min(page, totalPages) : DEFAULT_PAGE;

    // 현재 페이지 질문 목록 조회
    const questionDocs = await QuestionModel.find(filter, {
      _id: 1,
      content: 1,
      tags: 1,
      isBookmarked: 1,
      createdAt: 1,
    })
      .sort({
        lastActivityAt: -1, // 최근 활동(질문 생성/답변) 순으로 정렬
        createdAt: -1, // 최근 생성된 순으로 정렬
        _id: -1,
      })
      .skip((currentPage - 1) * limit)
      .limit(limit)
      .lean<QuestionDoc[]>();

    // 응답에 사용할 형태로 매핑
    const questionList: QuestionListItem[] = questionDocs.map((doc) => ({
      questionId: doc._id.toString(),
      content: doc.content,
      isBookmarked: doc.isBookmarked,
      tags: doc.tags,
      createdAt: doc.createdAt.toISOString(),
    }));

    // 페이지네이션 메타데이터 계산
    const hasNextPage = currentPage < totalPages;

    // 질문 목록 응답
    return NextResponse.json(
      {
        items: questionList,
        page: currentPage,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(`GET /api/questions db error`, {
      err,
      page,
      limit,
      isBookmarkedFilter,
    });

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}

type GeneratedQuestion = {
  content: string;
  exampleAnswer: string;
  tags: string[];
};

// POST /api/questions
// - 사용자 프로필 기반 면접 질문을 생성·저장하고 questionId를 반환하는 핸들러
export async function POST() {
  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error('POST /api/questions unexpected error in requireUserId', err);

    // 인증 이외의 예기치 못한 서버 오류
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  try {
    await dbConnect();

    // 현재 사용자 프로필, 사용자의 이전 질문 목록(최대 50개) 조회
    const [profile, prevQuestions] = await Promise.all([
      ProfileModel.findOne({
        userId,
      }).lean<ProfileDoc | null>(),
      QuestionModel.find({ userId })
        .select('content')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean<{ content: string }[]>(),
    ]);

    // 프로필이 없으면 질문을 생성할 수 없으므로 400 반환
    if (!profile) {
      return NextResponse.json(
        { error: '프로필 설정이 필요합니다.' },
        { status: 400 },
      );
    }

    const { position, experience, skills } = profile;
    const focusSkill =
      skills.length > 0
        ? skills[Math.floor(Math.random() * skills.length)]
        : null;
    const auxiliarySkills =
      focusSkill !== null
        ? skills.filter((skill) => skill !== focusSkill)
        : skills;

    // OpenAI에 넘길 사용자 소개 텍스트 구성
    let introduction = `- 직무: ${position}`;

    if (experience !== null) {
      introduction += `\n- 경력: ${experience === 0 ? '신입' : `${experience}년차`}`;
    }

    if (focusSkill !== null) {
      introduction += `\n- 이번 질문의 중심 기술: ${focusSkill}`;
    }

    if (auxiliarySkills.length > 0) {
      introduction += `\n- 참고 가능한 보조 기술: ${auxiliarySkills.join(', ')}`;
    }

    if (prevQuestions.length > 0) {
      introduction += `\n\n- 이미 받은 질문 목록:`;
      introduction += prevQuestions
        .map((q, idx) => `\n${idx + 1}. ${q.content}`)
        .join('');
    }

    // 면접 질문 생성 요청
    let response = await createQuestionResponse({
      introduction,
      maxTokens: 800,
    });

    if (response.status === 'incomplete') {
      console.error('OpenAI response incomplete (1st try)', {
        incomplete_details: response.incomplete_details,
      });

      response = await createQuestionResponse({
        introduction,
        maxTokens: 1400,
      });
    }

    // 2차도 incomplete면 실패 처리
    if (response.status === 'incomplete') {
      console.error('OpenAI response incomplete (2nd try)', {
        incomplete_details: response.incomplete_details,
      });

      return NextResponse.json(
        { error: '면접 질문 생성에 실패했습니다. (응답이 잘렸습니다)' },
        { status: 500 },
      );
    }

    const raw = response.output_text;

    // OpenAI 응답에 output_text가 있는지 확인
    if (!raw) {
      console.error('OpenAI 응답에 output_text가 없습니다.', response);

      return NextResponse.json(
        { error: '면접 질문 생성에 실패했습니다.' },
        { status: 500 },
      );
    }

    let parsed: Partial<GeneratedQuestion>;

    try {
      // JSON 파싱
      parsed = JSON.parse(raw) as GeneratedQuestion;
    } catch (err) {
      console.error('Failed to parse OpenAI response as JSON', {
        raw,
        err,
      });

      return NextResponse.json(
        { error: '면접 질문 생성에 실패했습니다.' },
        { status: 500 },
      );
    }

    const { content, exampleAnswer, tags } = parsed;

    // content / exampleAnswer / tags 필드 유효성 검사
    if (
      typeof content !== 'string' ||
      typeof exampleAnswer !== 'string' ||
      !Array.isArray(tags) ||
      tags.length === 0 ||
      !tags.every((tag) => typeof tag === 'string')
    ) {
      console.error('Invalid generated question format', parsed);

      return NextResponse.json(
        { error: '생성된 응답 형식이 올바르지 않습니다.' },
        { status: 500 },
      );
    }

    // 태그 정규화 (trim + 소문자 + 5개까지 제한)
    const normalizedTags = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 5);

    if (normalizedTags.length === 0) {
      return NextResponse.json(
        { error: '생성된 태그가 올바르지 않습니다.' },
        { status: 500 },
      );
    }

    // 생성된 질문을 DB에 저장
    const { _id } = await QuestionModel.create({
      userId,
      content,
      exampleAnswer,
      tags: normalizedTags,
    });

    const questionId = _id.toString();

    // 생성된 questionId를 응답으로 반환
    return NextResponse.json({ questionId }, { status: 201 });
  } catch (err) {
    console.error('POST /api/questions unexpected error', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
