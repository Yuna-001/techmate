import 'server-only';

import { openai } from '@/lib/ai/client';
import type { Feedback } from '@/models/answer';

type FeedbackInput = {
  question: string;
  idealAnswer: string;
  answer: string;
};

const FEEDBACK_SYSTEM_PROMPT = [
  '당신은 기술 면접관입니다.',
  '지원자의 기술 면접 답변에 대해 구조화된 피드백을 제공합니다.',
  '',
  '응답은 반드시 유효한 JSON 형식으로만 출력해야 합니다.',
  '설명 텍스트, 마크다운, 코드블록 등 JSON 바깥의 내용은 절대 쓰지 마세요.',
  '',
  'JSON 구조는 다음과 같습니다:',
  '{',
  '  "score": 0,',
  '  "summary": "전체적인 한 줄~두 줄 요약",',
  '  "strengths": ["잘한 점 1", "잘한 점 2"],',
  '  "improvements": ["개선점 1", "개선점 2"],',
  '  "missingKeywords": ["빠진 핵심 키워드 1", "빠진 핵심 키워드 2"]',
  '}',
  '',
  '평가 기준:',
  '- 기술적 정확성, 핵심 개념 포함 여부, 설명의 구체성, 면접 답변으로서의 전달력을 기준으로 평가합니다.',
  '- 추측하지 말고, 지원자의 답변에 근거해서 평가합니다.',
  '',
  '점수 기준:',
  '- 90~100: 핵심 개념이 정확하고, 구조적이며, 면접 답변으로 충분히 우수합니다.',
  '- 70~89: 대체로 정확하지만 일부 핵심 개념이나 구체성이 부족합니다.',
  '- 40~69: 부분적으로 맞지만 설명이 불완전하거나 중요한 개념이 빠져 있습니다.',
  '- 0~39: 질문을 제대로 답하지 못했거나 기술적으로 부정확합니다.',
  '',
  '규칙:',
  '- score는 0 이상 100 이하의 정수로만 작성합니다.',
  '- summary는 한국어 존댓말로 작성합니다.',
  '- strengths, improvements의 각 요소는 한국어 존댓말 한 문장으로 작성합니다.',
  '- strengths는 답변에서 실제로 잘 드러난 점만 작성합니다.',
  '- improvements는 다음 답변에서 바로 보완할 수 있도록 구체적으로 작성합니다.',
  '- missingKeywords는 지원자의 답변에서 빠졌거나 충분히 드러나지 않은 핵심 개념을 0~3개 작성합니다.',
  '- missingKeywords는 한국어를 기본으로 작성하되, SSG, CSR, SSR, TypeScript, Closure, Hoisting처럼 일반적으로 영어 약어 또는 영어 명칭으로 쓰는 기술 용어는 그대로 작성합니다.',
  '- 사용자가 이미 의미상 충분히 설명한 개념은 missingKeywords에 포함하지 않습니다.',
  '- 관련 키워드가 없거나 답변이 이미 충분하면 missingKeywords는 빈 배열로 작성합니다.',
  '- 위 JSON 객체 하나만 반환하고, 그 외 다른 텍스트는 절대 포함하지 마세요.',
].join('\n');

/** 질문/모범 답안/사용자 답변으로 user 프롬프트 문자열을 생성하는 함수 */
const createFeedbackUserPrompt = (input: FeedbackInput): string => {
  const { question, idealAnswer, answer } = input;

  return [
    '다음은 기술 면접 질문, 모범 답안, 그리고 지원자의 실제 답변입니다.',
    '',
    '[질문]',
    question,
    '',
    '[모범 답안 예시]',
    idealAnswer,
    '',
    '[지원자 답변]',
    answer,
    '',
    '위 지원자 답변에 대해, 앞에서 정의한 JSON 형식에 정확히 맞는 하나의 JSON 객체만 반환하세요.',
  ].join('\n');
};

/** 문자열 배열을 trim/빈값 제거 후, 유효하지 않으면 null을 반환하는 함수 */
const normalizeStringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return normalized;
};

/** OpenAI output_text(JSON)를 Feedback으로 파싱/검증하고, 실패 시 에러를 던지는 함수 */
const parseFeedback = (raw: string): Feedback => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse OpenAI response as JSON', { raw, err });
    throw new Error('피드백 생성에 실패했습니다.', { cause: err });
  }

  if (typeof parsed !== 'object' || parsed === null) {
    console.error('Parsed feedback is not an object', parsed);
    throw new Error('생성된 응답 형식이 올바르지 않습니다.');
  }

  const { score, summary, strengths, improvements, missingKeywords } =
    parsed as Record<string, unknown>;

  const normalizedSummary = typeof summary === 'string' ? summary.trim() : '';
  const normalizedStrengths = normalizeStringArray(strengths);
  const normalizedImprovements = normalizeStringArray(improvements);
  const normalizedMissingKeywords = normalizeStringArray(missingKeywords);

  const isValidScore =
    typeof score === 'number' &&
    Number.isInteger(score) &&
    score >= 0 &&
    score <= 100;

  if (
    normalizedSummary.length === 0 ||
    !isValidScore ||
    normalizedStrengths === null ||
    normalizedImprovements === null ||
    normalizedMissingKeywords === null
  ) {
    console.error('Invalid generated feedback format', parsed);
    throw new Error('생성된 응답 형식이 올바르지 않습니다.');
  }

  return {
    score,
    summary: normalizedSummary,
    strengths: normalizedStrengths,
    improvements: normalizedImprovements,
    missingKeywords: normalizedMissingKeywords,
  };
};

/** OpenAI로 피드백을 생성한 뒤, 파싱/검증된 피드백을 반환하는 함수 */
export const generateFeedback = async (
  input: FeedbackInput,
): Promise<Feedback> => {
  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      { role: 'system', content: FEEDBACK_SYSTEM_PROMPT },
      { role: 'user', content: createFeedbackUserPrompt(input) },
    ],
    text: { format: { type: 'json_object' } },
    max_output_tokens: 700,
  });

  const raw = response.output_text;

  if (!raw) {
    console.error('OpenAI 응답에 output_text가 없습니다.', response);
    throw new Error('피드백 생성에 실패했습니다.');
  }

  return parseFeedback(raw);
};
