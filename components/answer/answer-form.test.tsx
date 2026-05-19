import { MAX_ANSWER_LENGTH } from '@/lib/constants/answer';
import { clientFetch } from '@/lib/fetch/client';
import type { FetchErrorResult, FetchSuccessResult } from '@/lib/fetch/core';
import { FAIL_500 } from '@/test/fixtures/fetch';
import type { MockClientFetch } from '@/test/types';
import { createDeferred } from '@/test/utils/async';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { AnswerForm } from './answer-form';

const mockPush = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    prefetch: mockPrefetch,
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
const ANSWER_ID = 'a1';

const SUCCESS_200 = {
  ok: true,
  status: 200,
  data: { answerId: ANSWER_ID },
} as const;

const renderAnswerForm = () => {
  const user = userEvent.setup();
  render(<AnswerForm questionId={QUESTION_ID} />);

  return { user };
};

const getTextarea = () => screen.getByRole('textbox', { name: '사용자 답변' });
const getSubmitButton = (name: RegExp | string = '피드백 받기') =>
  screen.getByRole('button', { name });

describe('AnswerForm', () => {
  test('초기 렌더링 시 입력값은 비어 있고 제출 버튼은 비활성화된다', () => {
    renderAnswerForm();

    expect(getTextarea()).toHaveValue('');
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(getSubmitButton()).toBeDisabled();
  });

  test('답변을 입력하면 글자 수가 갱신되고 제출 버튼이 활성화된다', async () => {
    const { user } = renderAnswerForm();

    await user.type(getTextarea(), '좋은 답변입니다.');

    expect(screen.getByText('9')).toBeInTheDocument();
    expect(getSubmitButton()).toBeEnabled();
  });

  test(`답변이 ${MAX_ANSWER_LENGTH}자를 초과하면 textarea가 invalid 상태가 되고 제출 버튼이 비활성화된다`, async () => {
    renderAnswerForm();

    fireEvent.change(getTextarea(), {
      target: { value: 'a'.repeat(MAX_ANSWER_LENGTH + 1) },
    });

    expect(getTextarea()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(String(MAX_ANSWER_LENGTH + 1))).toHaveClass(
      'text-red-600',
    );
    expect(getSubmitButton()).toBeDisabled();
  });

  test('유효한 답변을 제출하면 답변 생성 API를 POST로 호출한다', async () => {
    mockClientFetch.mockResolvedValueOnce(SUCCESS_200);

    const { user } = renderAnswerForm();

    await user.type(getTextarea(), '사용자 답변');
    await user.click(getSubmitButton());

    expect(mockClientFetch).toHaveBeenCalledWith(
      `/api/questions/${QUESTION_ID}/answers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: '사용자 답변' }),
      },
    );
  });

  test('답변 생성에 성공하면 답변 상세 페이지를 prefetch하고 이동한다', async () => {
    mockClientFetch.mockResolvedValueOnce(SUCCESS_200);

    const { user } = renderAnswerForm();
    const href = `/questions/${QUESTION_ID}/answers/${ANSWER_ID}`;

    await user.type(getTextarea(), '사용자 답변');
    await user.click(getSubmitButton());

    expect(mockPrefetch).toHaveBeenCalledWith(href);
    expect(mockPush).toHaveBeenCalledWith(href, { scroll: false });
  });

  test('답변 생성 요청 중에는 로딩 상태를 표시한다', async () => {
    const deferred = createDeferred<
      FetchSuccessResult<{ answerId: string }> | FetchErrorResult
    >();
    mockClientFetch.mockReturnValueOnce(deferred.promise);

    const { user } = renderAnswerForm();

    await user.type(getTextarea(), '사용자 답변');

    const submitButton = getSubmitButton();
    await user.click(submitButton);

    expect(mockClientFetch).toHaveBeenCalledTimes(1);

    const loadingButton = getSubmitButton(/피드백 생성 중/);
    expect(loadingButton).toBe(submitButton);
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    expect(mockPush).not.toHaveBeenCalled();

    deferred.resolve(SUCCESS_200);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        `/questions/${QUESTION_ID}/answers/${ANSWER_ID}`,
        { scroll: false },
      );
    });
  });

  test('답변 생성 요청이 실패하면 에러 토스트를 표시하고 버튼을 다시 활성화한다', async () => {
    const deferred = createDeferred<
      FetchSuccessResult<{ answerId: string }> | FetchErrorResult
    >();
    mockClientFetch.mockReturnValueOnce(deferred.promise);

    const { user } = renderAnswerForm();

    await user.type(getTextarea(), '사용자 답변');

    const submitButton = getSubmitButton();
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    deferred.resolve(FAIL_500);

    await waitFor(() => {
      expect(getSubmitButton()).toBeEnabled();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('피드백 생성에 실패했습니다.', {
      description: '잠시 후 다시 시도해주세요.',
    });
  });

  test('네트워크 오류가 발생하면 에러 토스트를 표시하고 버튼을 다시 활성화한다', async () => {
    mockClientFetch.mockRejectedValueOnce(new Error());

    const { user } = renderAnswerForm();

    await user.type(getTextarea(), '사용자 답변');
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(getSubmitButton()).toBeEnabled();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('네트워크 오류가 발생했습니다.', {
      description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
    });
  });
});
