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
  '평가 기준:',
  '- 기술적 정확성, 핵심 개념 포함 여부, 설명의 구체성, 면접 답변으로서의 전달력을 기준으로 평가합니다.',
  '- 추측하지 말고, 지원자의 답변에 근거해서 평가합니다.',
  '- 모범 답안 예시는 평가 기준으로 참고하되, 의미상 동등한 설명은 정답으로 인정합니다.',
  '',
  '점수 기준:',
  '- 90~100: 핵심 개념이 정확하고, 구조적이며, 면접 답변으로 충분히 우수합니다.',
  '- 70~89: 대체로 정확하지만 일부 핵심 개념이나 구체성이 부족합니다.',
  '- 40~69: 부분적으로 맞지만 설명이 불완전하거나 중요한 개념이 빠져 있습니다.',
  '- 0~39: 질문을 제대로 답하지 못했거나 기술적으로 부정확합니다.',
  '',
  '규칙:',
  '- score는 0 이상 100 이하의 정수로만 작성합니다.',
  '- summary, strengths, improvements는 한국어 존댓말로 작성하고, strengths와 improvements의 각 요소는 한 문장으로 작성합니다.',
  '- summary, strengths, improvements에 지원자, 후보자, 사용자, 당신 같은 답변자 지칭 표현을 사용하지 마세요.',
  '  필요한 경우 "답변" 또는 "제시된 답변"처럼 중립적인 표현을 사용합니다.',
  '- strengths는 답변에서 실제로 잘 드러난 점만 0~3개 작성합니다.',
  '- improvements는 다음 답변에서 바로 보완할 수 있는 점만 0~3개 작성합니다.',
  '- 억지로 장점이나 개선점을 만들지 마세요.',
  '- missingKeywords는 질문과 모범 답안 예시를 기준으로 중요하지만, 지원자의 답변에서 빠졌거나 충분히 드러나지 않은 핵심 개념을 0~3개 작성합니다.',
  '- missingKeywords는 한국어를 기본으로 작성하되, SSG, CSR, SSR, TypeScript, Closure, Hoisting처럼 일반적으로 영어 약어 또는 영어 명칭으로 쓰는 기술 용어는 그대로 작성합니다.',
  '- 답변에서 이미 의미상 충분히 설명한 개념은 missingKeywords에 포함하지 않습니다.',
  '- 관련 키워드가 없거나 답변이 이미 충분하면 missingKeywords는 빈 배열로 작성합니다.',
].join('\n');

const FEEDBACK_RESPONSE_FORMAT = {
  type: 'json_schema',
  name: 'feedback',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      score: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
      },
      summary: {
        type: 'string',
        minLength: 10,
      },
      strengths: {
        type: 'array',
        minItems: 0,
        maxItems: 3,
        items: {
          type: 'string',
        },
      },
      improvements: {
        type: 'array',
        minItems: 0,
        maxItems: 3,
        items: {
          type: 'string',
        },
      },
      missingKeywords: {
        type: 'array',
        minItems: 0,
        maxItems: 3,
        items: {
          type: 'string',
        },
      },
    },
    required: [
      'score',
      'summary',
      'strengths',
      'improvements',
      'missingKeywords',
    ],
  },
} as const;

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
    '위 지원자 답변에 대해 피드백을 작성하세요.',
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

const createFeedbackResponse = ({
  input,
  maxTokens,
}: {
  input: FeedbackInput;
  maxTokens: number;
}) => {
  return openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      { role: 'system', content: FEEDBACK_SYSTEM_PROMPT },
      { role: 'user', content: createFeedbackUserPrompt(input) },
    ],
    text: { format: FEEDBACK_RESPONSE_FORMAT },
    max_output_tokens: maxTokens,
    temperature: 0,
  });
};

/** OpenAI로 피드백을 생성한 뒤, 파싱/검증된 피드백을 반환하는 함수 */
export const generateFeedback = async (
  input: FeedbackInput,
): Promise<Feedback> => {
  let response = await createFeedbackResponse({
    input,
    maxTokens: 900,
  });

  if (response.status === 'incomplete') {
    console.error('OpenAI feedback response incomplete (1st try)', {
      incomplete_details: response.incomplete_details,
    });

    response = await createFeedbackResponse({
      input,
      maxTokens: 1400,
    });
  }

  if (response.status === 'incomplete') {
    console.error('OpenAI feedback response incomplete (2nd try)', {
      incomplete_details: response.incomplete_details,
    });

    throw new Error('피드백 생성에 실패했습니다. (응답이 너무 깁니다.)');
  }

  const raw = response.output_text;

  if (!raw) {
    console.error('OpenAI 응답에 output_text가 없습니다.', response);
    throw new Error('피드백 생성에 실패했습니다.');
  }

  return parseFeedback(raw);
};
