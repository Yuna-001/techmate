import type { FetchSuccessResult } from '@/lib/fetch/core';
import { serverFetch } from '@/lib/fetch/server';
import type { MockClientFetch } from '@/test/types';
import type { QuestionListResponse } from '@/types/question';
import { render, screen, within } from '@testing-library/react';
import { QuestionList } from './question-list';

jest.mock('@/lib/fetch/server', () => ({
  serverFetch: jest.fn(),
}));

jest.mock('@/components/question/question-preview-card', () => ({
  QuestionPreviewCard: ({
    question,
  }: {
    question: { questionId: string; content: string };
  }) => <a href={`/questions/${question.questionId}`}>{question.content}</a>,
}));

jest.mock('@/components/common/responsive-pagination', () => ({
  ResponsivePagination: ({
    page,
    totalPages,
  }: {
    page: number;
    totalPages: number;
  }) => (
    <nav aria-label="페이지네이션">
      {page} / {totalPages}
    </nav>
  ),
}));

const mockServerFetch = serverFetch as unknown as MockClientFetch;

const QUESTIONS = [
  {
    questionId: 'question-1',
    content: 'React 상태 관리를 설명해주세요.',
    createdAt: '2026-05-25T00:00:00.000Z',
    isBookmarked: false,
    tags: ['react'],
  },
  {
    questionId: 'question-2',
    content: 'HTTP 캐싱을 설명해주세요.',
    createdAt: '2026-05-25T01:00:00.000Z',
    isBookmarked: true,
    tags: ['http'],
  },
];

const createQuestionListResponse = (
  overrides: Partial<QuestionListResponse> = {},
): FetchSuccessResult<QuestionListResponse> => ({
  ok: true,
  status: 200,
  data: {
    items: QUESTIONS,
    page: 1,
    limit: 5,
    totalCount: QUESTIONS.length,
    totalPages: 1,
    hasNextPage: false,
    ...overrides,
  },
});

describe('QuestionList', () => {
  test('items가 비어 있으면 빈 상태 문구를 렌더링한다', async () => {
    mockServerFetch.mockResolvedValueOnce(
      createQuestionListResponse({
        items: [],
        totalCount: 0,
        totalPages: 0,
      }),
    );

    render(await QuestionList({ page: 1, bookmarkFilter: false }));

    expect(
      screen.getByText('아직 생성된 질문이 없습니다.'),
    ).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('items가 있으면 질문 목록을 렌더링한다', async () => {
    mockServerFetch.mockResolvedValueOnce(createQuestionListResponse());

    render(await QuestionList({ page: 1, bookmarkFilter: false }));

    expect(
      screen.queryByText('아직 생성된 질문이 없습니다.'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(String(QUESTIONS.length))).toBeInTheDocument();

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');

    expect(items).toHaveLength(QUESTIONS.length);
    expect(
      screen.getByRole('link', { name: QUESTIONS[0].content }),
    ).toHaveAttribute('href', '/questions/question-1');
    expect(
      screen.getByRole('link', { name: QUESTIONS[1].content }),
    ).toHaveAttribute('href', '/questions/question-2');
  });
});
