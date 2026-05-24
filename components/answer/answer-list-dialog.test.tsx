import { clientFetch } from '@/lib/fetch/client';
import type { FetchErrorResult, FetchSuccessResult } from '@/lib/fetch/core';
import { FAIL_500 } from '@/test/fixtures/fetch';
import type { MockClientFetch } from '@/test/types';
import { createDeferred } from '@/test/utils/async';
import type { AnswerListItem, AnswerListResponse } from '@/types/answer';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnswerListDialog } from './answer-list-dialog';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/lib/fetch/client', () => ({
  clientFetch: jest.fn(),
}));

jest.mock('@/components/answer/answer-list', () => ({
  AnswerList: ({ items }: { questionId: string; items: AnswerListItem[] }) => (
    <div data-testid="answer-list">
      {items.map((item) => (
        <div key={item.answerId}>{item.content}</div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/common/dialog-pagination', () => ({
  DialogPagination: ({
    page,
    totalPages,
    onPageChange,
  }: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <nav aria-label="답변 페이지네이션">
      <span>{`pagination: ${page} / ${totalPages}`}</span>
      {Array.from({ length: totalPages }, (_, idx) => {
        const pageNumber = idx + 1;

        return (
          <button key={pageNumber} onClick={() => onPageChange(pageNumber)}>
            {pageNumber}페이지
          </button>
        );
      })}
    </nav>
  ),
}));

const mockClientFetch = clientFetch as unknown as MockClientFetch;

const QUESTION_ID = 'question-1';
const NEXT_QUESTION_ID = 'question-2';

const createResponse = ({
  items,
  page,
  totalPages = 3,
}: {
  items: AnswerListItem[];
  page: number;
  totalPages?: number;
}): FetchSuccessResult<AnswerListResponse> => ({
  ok: true,
  status: 200,
  data: {
    items,
    page,
    limit: 2,
    totalCount: 5,
    totalPages,
    hasNextPage: page < totalPages,
  },
});

const PAGE_1_RESPONSE = createResponse({
  page: 1,
  items: [
    {
      answerId: 'answer-1',
      content: '첫 번째 답변',
      score: 80,
      createdAt: '2026-05-25T00:00:00.000Z',
    },
    {
      answerId: 'answer-2',
      content: '두 번째 답변',
      score: 95,
      createdAt: '2026-05-25T01:00:00.000Z',
    },
  ],
});

const PAGE_2_RESPONSE = createResponse({
  page: 2,
  items: [
    {
      answerId: 'answer-3',
      content: '세 번째 답변',
      score: 70,
      createdAt: '2026-05-25T02:00:00.000Z',
    },
  ],
});

const NEXT_QUESTION_RESPONSE = createResponse({
  page: 1,
  items: [
    {
      answerId: 'answer-4',
      content: '최신 요청 답변',
      score: 88,
      createdAt: '2026-05-25T03:00:00.000Z',
    },
  ],
});

const renderAnswerListDialog = (questionId = QUESTION_ID) => {
  const user = userEvent.setup();
  const view = render(<AnswerListDialog questionId={questionId} />);

  return { user, ...view };
};

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: '답변 목록' }));
};

describe('AnswerListDialog', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue(`/questions/${QUESTION_ID}`);
  });

  test('초기 렌더링 시 다이얼로그는 닫혀 있고 API를 호출하지 않는다', () => {
    renderAnswerListDialog();

    expect(
      screen.getByRole('button', { name: '답변 목록' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockClientFetch).not.toHaveBeenCalled();
  });

  test('버튼 클릭 시 첫 페이지 답변 목록 API를 호출한다', async () => {
    mockClientFetch.mockResolvedValueOnce(PAGE_1_RESPONSE);
    const { user } = renderAnswerListDialog();

    await openDialog(user);

    expect(mockClientFetch).toHaveBeenCalledWith(
      `/api/questions/${QUESTION_ID}/answers?limit=2&page=1`,
    );
  });

  test('답변 목록 요청 중에는 총 개수, 목록, 페이지네이션을 숨긴다', async () => {
    const deferred = createDeferred<
      FetchSuccessResult<AnswerListResponse> | FetchErrorResult
    >();
    mockClientFetch.mockReturnValueOnce(deferred.promise);

    const { user } = renderAnswerListDialog();
    await openDialog(user);

    expect(screen.queryByText('총 5개')).not.toBeInTheDocument();
    expect(screen.queryByTestId('answer-list')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('답변 페이지네이션'),
    ).not.toBeInTheDocument();

    deferred.resolve(PAGE_1_RESPONSE);

    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();
  });

  test('답변 목록 요청 성공 시 총 개수, 답변 목록, 페이지네이션을 표시한다', async () => {
    mockClientFetch.mockResolvedValueOnce(PAGE_1_RESPONSE);
    const { user } = renderAnswerListDialog();

    await openDialog(user);

    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();
    expect(screen.getByText('두 번째 답변')).toBeInTheDocument();
    expect(screen.getByText('총 5개')).toBeInTheDocument();
    expect(screen.getByText('pagination: 1 / 3')).toBeInTheDocument();
  });

  test('페이지 변경 시 해당 페이지를 요청하고 다시 로딩 상태로 전환한다', async () => {
    const page2Deferred = createDeferred<
      FetchSuccessResult<AnswerListResponse> | FetchErrorResult
    >();
    mockClientFetch
      .mockResolvedValueOnce(PAGE_1_RESPONSE)
      .mockReturnValueOnce(page2Deferred.promise);

    const { user } = renderAnswerListDialog();
    await openDialog(user);

    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2페이지' }));

    expect(mockClientFetch).toHaveBeenLastCalledWith(
      `/api/questions/${QUESTION_ID}/answers?limit=2&page=2`,
    );
    expect(screen.queryByText('총 5개')).not.toBeInTheDocument();
    expect(screen.queryByText('첫 번째 답변')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('답변 페이지네이션'),
    ).not.toBeInTheDocument();

    page2Deferred.resolve(PAGE_2_RESPONSE);

    expect(await screen.findByText('세 번째 답변')).toBeInTheDocument();
    expect(screen.getByText('pagination: 2 / 3')).toBeInTheDocument();
  });

  test('답변 목록 요청이 실패하면 에러 문구와 다시 시도 버튼을 표시한다', async () => {
    mockClientFetch.mockResolvedValueOnce(FAIL_500);
    const { user } = renderAnswerListDialog();

    await openDialog(user);

    expect(
      await screen.findByText('답변 목록을 가져오는 데 실패했습니다.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '다시 시도' }),
    ).toBeInTheDocument();
  });

  test('네트워크 오류가 발생하면 에러 문구와 다시 시도 버튼을 표시한다', async () => {
    mockClientFetch.mockRejectedValueOnce(new Error());
    const { user } = renderAnswerListDialog();

    await openDialog(user);

    expect(
      await screen.findByText('네트워크 오류가 발생했습니다.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '다시 시도' }),
    ).toBeInTheDocument();
  });

  test('다시 시도 버튼을 클릭하면 현재 페이지를 다시 요청한다', async () => {
    mockClientFetch
      .mockResolvedValueOnce(FAIL_500)
      .mockResolvedValueOnce(PAGE_1_RESPONSE);
    const { user } = renderAnswerListDialog();

    await openDialog(user);
    await screen.findByText('답변 목록을 가져오는 데 실패했습니다.');

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockClientFetch).toHaveBeenCalledTimes(2);
    expect(mockClientFetch).toHaveBeenLastCalledWith(
      `/api/questions/${QUESTION_ID}/answers?limit=2&page=1`,
    );
    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();
  });

  test('다이얼로그를 닫았다가 다시 열면 page를 1로 초기화한다', async () => {
    mockClientFetch
      .mockResolvedValueOnce(PAGE_1_RESPONSE)
      .mockResolvedValueOnce(PAGE_2_RESPONSE)
      .mockResolvedValueOnce(PAGE_1_RESPONSE);
    const { user } = renderAnswerListDialog();

    await openDialog(user);
    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2페이지' }));
    expect(await screen.findByText('세 번째 답변')).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await openDialog(user);

    expect(mockClientFetch).toHaveBeenCalledTimes(3);
    expect(mockClientFetch).toHaveBeenLastCalledWith(
      `/api/questions/${QUESTION_ID}/answers?limit=2&page=1`,
    );
  });

  test('pathname이 변경되면 열린 다이얼로그를 닫는다', async () => {
    mockClientFetch.mockResolvedValueOnce(PAGE_1_RESPONSE);
    const { rerender, user } = renderAnswerListDialog();

    await openDialog(user);
    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();

    mockUsePathname.mockReturnValue(`/questions/${NEXT_QUESTION_ID}`);
    rerender(<AnswerListDialog questionId={QUESTION_ID} />);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('이전 요청이 늦게 끝나도 최신 요청 결과만 반영한다', async () => {
    const firstQuestionDeferred = createDeferred<
      FetchSuccessResult<AnswerListResponse> | FetchErrorResult
    >();
    const nextQuestionDeferred = createDeferred<
      FetchSuccessResult<AnswerListResponse> | FetchErrorResult
    >();
    mockClientFetch
      .mockReturnValueOnce(firstQuestionDeferred.promise)
      .mockReturnValueOnce(nextQuestionDeferred.promise);
    const { rerender, user } = renderAnswerListDialog();

    await openDialog(user);

    rerender(<AnswerListDialog questionId={NEXT_QUESTION_ID} />);

    await waitFor(() => {
      expect(mockClientFetch).toHaveBeenCalledTimes(2);
    });

    nextQuestionDeferred.resolve(NEXT_QUESTION_RESPONSE);
    expect(await screen.findByText('최신 요청 답변')).toBeInTheDocument();

    firstQuestionDeferred.resolve(PAGE_1_RESPONSE);

    await waitFor(() => {
      expect(screen.getByText('최신 요청 답변')).toBeInTheDocument();
      expect(screen.queryByText('첫 번째 답변')).not.toBeInTheDocument();
    });
  });
});
