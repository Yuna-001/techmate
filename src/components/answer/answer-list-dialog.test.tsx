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
const OTHER_QUESTION_ID = 'question-2';

type AnswerListFetchResult =
  | FetchSuccessResult<AnswerListResponse>
  | FetchErrorResult;

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

const PAGE_3_RESPONSE = createResponse({
  page: 3,
  items: [
    {
      answerId: 'answer-4',
      content: '네 번째 답변',
      score: 90,
      createdAt: '2026-05-25T03:00:00.000Z',
    },
  ],
});

const OTHER_QUESTION_RESPONSE = createResponse({
  page: 1,
  items: [
    {
      answerId: 'answer-5',
      content: '최신 요청 답변',
      score: 88,
      createdAt: '2026-05-25T04:00:00.000Z',
    },
  ],
});

const REOPENED_DIALOG_RESPONSE = createResponse({
  page: 1,
  items: [
    {
      answerId: 'answer-6',
      content: '다시 열기 요청 답변',
      score: 82,
      createdAt: '2026-05-25T05:00:00.000Z',
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

const closeDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  const dialog = screen.getByRole('dialog');
  await user.click(within(dialog).getByRole('button', { name: 'Close' }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
};

const setViewportHeight = (height: number) => {
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true,
    writable: true,
  });
};

describe('AnswerListDialog', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue(`/questions/${QUESTION_ID}`);
    setViewportHeight(600);
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
    const initialRequestDeferred = createDeferred<AnswerListFetchResult>();
    mockClientFetch.mockReturnValueOnce(initialRequestDeferred.promise);

    const { user } = renderAnswerListDialog();
    await openDialog(user);

    expect(screen.queryByText('총 5개')).not.toBeInTheDocument();
    expect(screen.queryByTestId('answer-list')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('답변 페이지네이션'),
    ).not.toBeInTheDocument();

    initialRequestDeferred.resolve(PAGE_1_RESPONSE);

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

  test('페이지 변경 중에는 목록만 로딩 상태로 전환하고 총 개수와 페이지네이션을 유지한다', async () => {
    const page2Deferred = createDeferred<AnswerListFetchResult>();
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
    expect(screen.getByText('총 5개')).toBeInTheDocument();
    expect(screen.queryByText('첫 번째 답변')).not.toBeInTheDocument();
    expect(screen.getByLabelText('답변 페이지네이션')).toBeInTheDocument();

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

  test('페이지 변경 요청이 실패하면 기존 총 개수와 페이지네이션을 숨긴다', async () => {
    mockClientFetch
      .mockResolvedValueOnce(PAGE_1_RESPONSE)
      .mockResolvedValueOnce(FAIL_500);
    const { user } = renderAnswerListDialog();

    await openDialog(user);
    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2페이지' }));

    expect(
      await screen.findByText('답변 목록을 가져오는 데 실패했습니다.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('총 5개')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('답변 페이지네이션'),
    ).not.toBeInTheDocument();
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

  test('페이지 변경 요청이 실패한 뒤 다시 시도하면 실패한 현재 페이지를 다시 요청한다', async () => {
    mockClientFetch
      .mockResolvedValueOnce(PAGE_1_RESPONSE)
      .mockResolvedValueOnce(FAIL_500)
      .mockResolvedValueOnce(PAGE_2_RESPONSE);
    const { user } = renderAnswerListDialog();

    await openDialog(user);
    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2페이지' }));
    await screen.findByText('답변 목록을 가져오는 데 실패했습니다.');

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockClientFetch).toHaveBeenCalledTimes(3);
    expect(mockClientFetch).toHaveBeenLastCalledWith(
      `/api/questions/${QUESTION_ID}/answers?limit=2&page=2`,
    );
    expect(await screen.findByText('세 번째 답변')).toBeInTheDocument();
  });

  test('현재 페이지를 다시 클릭하면 답변 목록을 재요청하지 않는다', async () => {
    mockClientFetch.mockResolvedValueOnce(PAGE_1_RESPONSE);
    const { user } = renderAnswerListDialog();

    await openDialog(user);
    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '1페이지' }));

    expect(mockClientFetch).toHaveBeenCalledTimes(1);
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

    await closeDialog(user);

    await openDialog(user);

    expect(mockClientFetch).toHaveBeenCalledTimes(3);
    expect(mockClientFetch).toHaveBeenLastCalledWith(
      `/api/questions/${QUESTION_ID}/answers?limit=2&page=1`,
    );
  });

  test('pathname이 변경되면 열린 다이얼로그를 닫고 원래 경로로 돌아와도 다시 열지 않는다', async () => {
    mockClientFetch.mockResolvedValueOnce(PAGE_1_RESPONSE);
    const { rerender, user } = renderAnswerListDialog();

    await openDialog(user);
    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();

    mockUsePathname.mockReturnValue(`/questions/${OTHER_QUESTION_ID}`);
    rerender(<AnswerListDialog questionId={QUESTION_ID} />);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    mockUsePathname.mockReturnValue(`/questions/${QUESTION_ID}`);
    rerender(<AnswerListDialog questionId={QUESTION_ID} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockClientFetch).toHaveBeenCalledTimes(1);
  });

  test('pathname 변경 뒤 이전 응답이 늦게 도착해도 다시 열기 결과를 유지한다', async () => {
    const changedPathnameDeferred = createDeferred<AnswerListFetchResult>();
    mockClientFetch
      .mockReturnValueOnce(changedPathnameDeferred.promise)
      .mockResolvedValueOnce(REOPENED_DIALOG_RESPONSE);
    const { rerender, user } = renderAnswerListDialog();

    await openDialog(user);

    mockUsePathname.mockReturnValue(
      `/questions/${QUESTION_ID}/answers/answer-1`,
    );
    rerender(<AnswerListDialog questionId={QUESTION_ID} />);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    changedPathnameDeferred.resolve(PAGE_1_RESPONSE);

    mockUsePathname.mockReturnValue(`/questions/${QUESTION_ID}`);
    rerender(<AnswerListDialog questionId={QUESTION_ID} />);

    await openDialog(user);

    expect(await screen.findByText('다시 열기 요청 답변')).toBeInTheDocument();
    expect(screen.queryByText('첫 번째 답변')).not.toBeInTheDocument();
  });

  test('다이얼로그를 닫은 뒤 이전 응답이 늦게 도착해도 다시 열기 결과를 유지한다', async () => {
    const closedDialogDeferred = createDeferred<AnswerListFetchResult>();
    mockClientFetch
      .mockReturnValueOnce(closedDialogDeferred.promise)
      .mockResolvedValueOnce(REOPENED_DIALOG_RESPONSE);
    const { user } = renderAnswerListDialog();

    await openDialog(user);

    await closeDialog(user);

    closedDialogDeferred.resolve(PAGE_1_RESPONSE);

    await openDialog(user);

    expect(await screen.findByText('다시 열기 요청 답변')).toBeInTheDocument();
    expect(screen.queryByText('첫 번째 답변')).not.toBeInTheDocument();
  });

  test.each([
    { height: 600, expectedLimit: 2 },
    { height: 740, expectedLimit: 3 },
    { height: 900, expectedLimit: 4 },
  ])(
    '뷰포트 높이 $height px에서 다이얼로그를 열면 limit=$expectedLimit 로 요청한다',
    async ({ height, expectedLimit }) => {
      setViewportHeight(height);
      mockClientFetch.mockResolvedValueOnce(PAGE_1_RESPONSE);
      const { user } = renderAnswerListDialog();

      await openDialog(user);

      expect(mockClientFetch).toHaveBeenCalledWith(
        `/api/questions/${QUESTION_ID}/answers?limit=${expectedLimit}&page=1`,
      );
    },
  );

  test('연속으로 페이지를 변경했을 때 이전 페이지 응답이 늦게 도착해도 마지막으로 요청한 페이지를 유지한다', async () => {
    const page2Deferred = createDeferred<AnswerListFetchResult>();
    const page3Deferred = createDeferred<AnswerListFetchResult>();
    mockClientFetch
      .mockResolvedValueOnce(PAGE_1_RESPONSE)
      .mockReturnValueOnce(page2Deferred.promise)
      .mockReturnValueOnce(page3Deferred.promise);
    const { user } = renderAnswerListDialog();

    await openDialog(user);
    expect(await screen.findByText('첫 번째 답변')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2페이지' }));
    await user.click(screen.getByRole('button', { name: '3페이지' }));

    page3Deferred.resolve(PAGE_3_RESPONSE);
    expect(await screen.findByText('네 번째 답변')).toBeInTheDocument();
    expect(screen.getByText('pagination: 3 / 3')).toBeInTheDocument();

    page2Deferred.resolve(PAGE_2_RESPONSE);

    await waitFor(() => {
      expect(screen.getByText('네 번째 답변')).toBeInTheDocument();
      expect(screen.queryByText('세 번째 답변')).not.toBeInTheDocument();
      expect(screen.getByText('pagination: 3 / 3')).toBeInTheDocument();
    });
  });

  test('questionId가 변경됐을 때 이전 질문 응답이 늦게 도착해도 새 질문 결과를 유지한다', async () => {
    const firstQuestionDeferred = createDeferred<AnswerListFetchResult>();
    const nextQuestionDeferred = createDeferred<AnswerListFetchResult>();
    mockClientFetch
      .mockReturnValueOnce(firstQuestionDeferred.promise)
      .mockReturnValueOnce(nextQuestionDeferred.promise);
    const { rerender, user } = renderAnswerListDialog();

    await openDialog(user);

    rerender(<AnswerListDialog questionId={OTHER_QUESTION_ID} />);

    await waitFor(() => {
      expect(mockClientFetch).toHaveBeenCalledTimes(2);
    });

    nextQuestionDeferred.resolve(OTHER_QUESTION_RESPONSE);
    expect(await screen.findByText('최신 요청 답변')).toBeInTheDocument();

    firstQuestionDeferred.resolve(PAGE_1_RESPONSE);

    await waitFor(() => {
      expect(screen.getByText('최신 요청 답변')).toBeInTheDocument();
      expect(screen.queryByText('첫 번째 답변')).not.toBeInTheDocument();
    });
  });
});
