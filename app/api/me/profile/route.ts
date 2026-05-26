import { requireUserId } from '@/lib/auth/requireUserId';
import { MAX_EXPERIENCE } from '@/lib/constants/profile';
import dbConnect from '@/lib/dbConnect';
import { HttpError } from '@/lib/error';
import ProfileModel from '@/models/profile';
import type { ProfileDoc, ProfileResponse } from '@/types/profile';
import { NextResponse } from 'next/server';

// GET /api/me/profile
// - 사용자의 프로필을 조회하는 핸들러
export async function GET() {
  let userId: string;

  // 인증된 사용자의 ID 조회
  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error('GET /api/me/profile unexpected error in requireUserId', err);

    // 인증 이외의 예기치 못한 서버 오류
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  try {
    // DB 연결
    await dbConnect();

    // 사용자 프로필 조회
    const profile = await ProfileModel.findOne({
      userId,
    }).lean<ProfileDoc | null>();

    // 프로필이 없으면 기본값 반환
    if (!profile) {
      return NextResponse.json<ProfileResponse>(
        { position: null, skills: [], experience: null },
        { status: 200 },
      );
    }

    const { position, skills, experience } = profile;

    // 프로필이 존재하면 실제 값 반환
    return NextResponse.json<ProfileResponse>(
      { position, skills, experience },
      { status: 200 },
    );
  } catch (err) {
    console.error('GET /api/me/profile db error', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// PUT /api/me/profile
// - 사용자의 프로필을 생성 또는 업데이트하는 핸들러
export async function PUT(req: Request) {
  let userId: string;

  // 인증된 사용자의 ID 조회
  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error('PUT /api/me/profile unexpected error in requireUserId', err);

    // 인증 이외의 예기치 못한 서버 오류
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  // 요청 바디 파싱 및 유효성 검사
  let body: unknown;

  try {
    body = await req.json();
  } catch (err) {
    console.error(`PUT /api/me/profile failed to parse JSON body`, err);

    return NextResponse.json(
      { error: '잘못된 요청 본문입니다.' },
      { status: 400 },
    );
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const { position, experience, skills } = body as Partial<ProfileDoc>;

  // position: 필수, 문자열, trim 후 비어있으면 안 됨
  const normalizedPosition =
    typeof position === 'string' ? position.trim() : '';

  if (!normalizedPosition) {
    return NextResponse.json(
      { error: '직무를 입력해주세요.' },
      { status: 400 },
    );
  }

  // experience: 선택, null 또는 0~MAX_EXPERIENCE 정수
  let normalizedExperience: number | null = null;

  if (experience === undefined || experience === null) {
    normalizedExperience = null;
  } else if (
    typeof experience !== 'number' ||
    !Number.isInteger(experience) ||
    experience < 0 ||
    experience > MAX_EXPERIENCE
  ) {
    return NextResponse.json(
      { error: `경력은 0~${MAX_EXPERIENCE} 사이의 정수를 입력해주세요.` },
      { status: 400 },
    );
  } else {
    normalizedExperience = experience;
  }

  // skills: 선택, string[]
  let normalizedSkills: string[] = [];

  if (skills === undefined) {
    normalizedSkills = [];
  } else if (
    !Array.isArray(skills) ||
    !skills.every((s) => typeof s === 'string')
  ) {
    return NextResponse.json(
      { error: '기술 스택 형식이 잘못되었습니다.' },
      { status: 400 },
    );
  } else {
    const seen = new Set<string>();

    normalizedSkills = skills
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .filter((s) => {
        if (seen.has(s)) return false;
        seen.add(s);
        return true;
      });
  }

  try {
    // DB 연결
    await dbConnect();

    // 프로필이 없으면 새로 생성, 있으면 내용 업데이트
    await ProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          position: normalizedPosition,
          skills: normalizedSkills,
          experience: normalizedExperience,
        },
      },
      {
        upsert: true,
      },
    );

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('PUT /api/me/profile db error', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
