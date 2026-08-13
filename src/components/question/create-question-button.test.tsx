import { clientFetch } from '@/lib/fetch/client';
import type { FetchErrorResult, FetchSuccessResult } from '@/lib/fetch/core';
import { FAIL_500 } from '@/test/fixtures/fetch';
import type { MockClientFetch } from '@/test/types';
import { createDeferred } from '@/test/utils/async';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { CreateQuestionButton } from './create-question-button';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/lib/fetch/client', () => ({
  clientFetch: jest.fn(),
}));

const mockClientFetch = clientFetch as unknown as MockClientFetch;

const QUESTION_ID = 'q1';

const SUCCESS_200 = {
  ok: true,
  status: 200,
  data: { questionId: QUESTION_ID },
} as const;

describe('CreateQuestionButton', () => {
  test('프로필이 설정되지 않으면 안내 문구와 프로필 설정 링크를 표시하고 버튼을 비활성화한다', async () => {
    const user = userEvent.setup();

    render(<CreateQuestionButton hasProfile={false} />);

    expect(screen.getByText(/기술 질문 생성을 위해/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '프로필 설정' })).toHaveAttribute(
      'href',
      '/setting/profile/edit',
    );

    const createButton = screen.getByRole('button', {
      name: /기술 질문 생성하기/,
    });

    expect(createButton).toBeDisabled();

    await user.click(createButton);

    expect(mockClientFetch).not.toHaveBeenCalled();
  });

  test('버튼 클릭 시 질문 생성 API를 POST로 호출한다', async () => {
    mockClientFetch.mockResolvedValueOnce(SUCCESS_200);

    const user = userEvent.setup();

    render(<CreateQuestionButton />);

    await user.click(
      screen.getByRole('button', {
        name: /기술 질문 생성하기/,
      }),
    );

    expect(mockClientFetch).toHaveBeenCalledWith('/api/questions', {
      method: 'POST',
    });
  });

  test('질문 생성 성공 시 생성된 질문의 상세 페이지로 이동한다', async () => {
    mockClientFetch.mockResolvedValueOnce(SUCCESS_200);

    const user = userEvent.setup();

    render(<CreateQuestionButton />);

    await user.click(
      screen.getByRole('button', {
        name: /기술 질문 생성하기/,
      }),
    );

    expect(mockPush).toHaveBeenCalledWith(`/questions/${QUESTION_ID}`);
  });

  test('질문 생성 실패 시 에러 토스트를 표시한다', async () => {
    mockClientFetch.mockResolvedValueOnce(FAIL_500);

    const user = userEvent.setup();

    render(<CreateQuestionButton />);

    await user.click(
      screen.getByRole('button', {
        name: /기술 질문 생성하기/,
      }),
    );

    expect(toast.error).toHaveBeenCalledWith('기술 질문 생성에 실패했습니다.', {
      description: '잠시 후 다시 시도해주세요.',
    });
  });

  test('네트워크 오류 발생 시 에러 토스트를 표시하고 버튼을 다시 활성화한다', async () => {
    mockClientFetch.mockRejectedValueOnce(new Error());

    const user = userEvent.setup();

    render(<CreateQuestionButton />);

    await user.click(
      screen.getByRole('button', {
        name: /기술 질문 생성하기/,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /기술 질문 생성하기/ }),
      ).toBeEnabled();
    });

    expect(toast.error).toHaveBeenCalledWith('네트워크 오류가 발생했습니다.', {
      description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
    });
  });

  test('질문 생성 요청 중에는 로딩 상태를 표시한다', async () => {
    const deferred = createDeferred<
      FetchSuccessResult<{ questionId: string }> | FetchErrorResult
    >();
    mockClientFetch.mockReturnValueOnce(deferred.promise);

    const user = userEvent.setup();

    render(<CreateQuestionButton />);

    const createButton = screen.getByRole('button', {
      name: /기술 질문 생성하기/,
    });

    await user.click(createButton);

    expect(mockClientFetch).toHaveBeenCalledTimes(1);

    const loadingButton = screen.getByRole('button', {
      name: /기술 질문 생성 중/,
    });

    expect(loadingButton).toBeDisabled();
    expect(screen.getByText('기술 스택을 훑어보는 중...')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();

    deferred.resolve(SUCCESS_200);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/questions/${QUESTION_ID}`);
    });
  });

  test('질문 생성 요청 실패 시 에러 토스트를 표시하고 로딩 상태가 해제된다', async () => {
    const deferred = createDeferred<
      FetchSuccessResult<{ questionId: string }> | FetchErrorResult
    >();
    mockClientFetch.mockReturnValueOnce(deferred.promise);

    const user = userEvent.setup();

    render(<CreateQuestionButton />);

    const createButton = screen.getByRole('button', {
      name: /기술 질문 생성하기/,
    });

    await user.click(createButton);

    expect(mockClientFetch).toHaveBeenCalledTimes(1);
    expect(createButton).toBeDisabled();

    deferred.resolve(FAIL_500);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /기술 질문 생성하기/ }),
      ).toBeEnabled();
    });

    expect(
      screen.queryByText('기술 스택을 훑어보는 중...'),
    ).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('기술 질문 생성에 실패했습니다.', {
      description: '잠시 후 다시 시도해주세요.',
    });
  });
});
