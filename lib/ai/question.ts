import 'server-only';

import { openai } from '@/lib/ai/client';

const QUESTION_RESPONSE_FORMAT = {
  type: 'json_schema',
  name: 'generated_question',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      content: {
        type: 'string',
        minLength: 10,
      },
      idealAnswer: {
        type: 'string',
        minLength: 30,
        maxLength: 500,
      },
      tags: {
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: {
          type: 'string',
        },
      },
    },
    required: ['content', 'idealAnswer', 'tags'],
  },
} as const;

export const createQuestionResponse = ({
  introduction,
  maxTokens,
}: {
  introduction: string;
  maxTokens: number;
}) => {
  return openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: [
          '당신은 기술 면접관입니다.',
          '아래 입력을 보고 적절한 기술 면접 질문 하나를 만드세요.',
          '',
          '규칙:',
          '- content와 idealAnswer는 모두 한국어 존댓말로 작성합니다.',
          '- content는 하나의 질문 문장으로 작성합니다.',
          '- content에 지원자, 후보자, 사용자, 당신 같은 답변자 지칭 표현을 사용하지 마세요.',
          '- 질문은 직무, 경력, 기술 스택 중 하나 이상과 직접 관련되어야 합니다.',
          '- "이번 질문의 중심 기술"이 제공되면 질문과 모범 답변은 해당 기술을 중심으로 작성합니다.',
          '- "참고 가능한 보조 기술"은 중심 기술을 설명하거나 실무 맥락을 만들 때만 최대 1개까지 사용합니다.',
          '- 질문과 모범 답변이 여러 기술을 병렬로 설명하거나 여러 주제로 확장되지 않게 합니다.',
          '- 너무 광범위한 개념 설명 질문보다 실제 면접에서 답변을 평가할 수 있는 구체적인 질문을 만드세요.',
          '- idealAnswer는 content 질문에 직접 답하는 모범 답변으로 작성합니다.',
          '- idealAnswer는 핵심 개념, 판단 기준, 실무적 근거와 피드백 평가에 필요한 핵심 키워드를 명확히 포함합니다.',
          '- idealAnswer에는 모범 답변 본문만 작성하고, 평가 기준이나 키워드 목록 같은 메타 설명을 포함하지 마세요.',
          '- tags는 영어 소문자 기술 이름만 사용합니다. 예: ["react", "typescript", "nextjs", "frontend"].',
          '- 태그 개수는 1개 이상 5개 이하로 만듭니다.',
          '- user 메시지에는 "이미 받은 질문 목록"이 함께 제공될 수 있습니다.',
          '  이 목록에 포함된 질문과 동일하거나, 내용이 매우 비슷한 질문은 절대 생성하지 마세요.',
          '- idealAnswer는 500자 이내로 작성합니다.',
          '- content와 idealAnswer에 코드/마크다운/백틱/줄바꿈을 포함하지 마세요.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: introduction,
      },
    ],
    text: {
      format: QUESTION_RESPONSE_FORMAT,
    },
    max_output_tokens: maxTokens,
    temperature: 0.5,
  });
};
