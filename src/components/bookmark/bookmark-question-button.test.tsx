import { clientFetch } from '@/lib/fetch/client';
import type {
  FetchErrorResult,
  FetchNoContentSuccessResult,
} from '@/lib/fetch/core';
import { FAIL_500, SUCCESS_204 } from '@/test/fixtures/fetch';
import type { MockClientFetch } from '@/test/types';
import { createDeferred } from '@/test/utils/async';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { BookmarkQuestionButton } from './bookmark-question-button';

jest.mock('@/lib/fetch/client', () => ({
  clientFetch: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

const mockClientFetch = clientFetch as unknown as MockClientFetch;

const QUESTION_ID = 'q1';

describe('BookmarkQuestionButton', () => {
  describe('초기 렌더링', () => {
    test('북마크되지 않은 상태면 북마크 추가 버튼으로 표시한다', () => {
      render(
        <BookmarkQuestionButton
          questionId={QUESTION_ID}
          initialIsBookmarked={false}
        />,
      );

      const button = screen.getByRole('button', { name: '북마크 추가' });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    test('북마크된 상태면 북마크 해제 버튼으로 표시한다', () => {
      render(
        <BookmarkQuestionButton
          questionId={QUESTION_ID}
          initialIsBookmarked={true}
        />,
      );

      const button = screen.getByRole('button', { name: '북마크 해제' });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('북마크 변경', () => {
    test('버튼 클릭 시 북마크 상태를 낙관적으로 변경하고 API를 PUT으로 호출한다', async () => {
      const deferred = createDeferred<
        FetchNoContentSuccessResult | FetchErrorResult
      >();
      mockClientFetch.mockReturnValueOnce(deferred.promise);

      const user = userEvent.setup();

      render(
        <BookmarkQuestionButton
          questionId={QUESTION_ID}
          initialIsBookmarked={false}
        />,
      );

      const button = screen.getByRole('button', { name: '북마크 추가' });

      await user.click(button);

      // 낙관적 업데이트
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-label', '북마크 해제');

      expect(mockClientFetch).toHaveBeenCalledWith(
        `/api/questions/${QUESTION_ID}/bookmark`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isBookmarked: true }),
          expectNoContent: true,
        },
      );
      expect(mockClientFetch).toHaveBeenCalledTimes(1);
    });

    test('북마크 변경 요청 중에는 버튼을 비활성화한다', async () => {
      const deferred = createDeferred<
        FetchNoContentSuccessResult | FetchErrorResult
      >();
      mockClientFetch.mockReturnValueOnce(deferred.promise);

      const user = userEvent.setup();

      render(
        <BookmarkQuestionButton
          questionId={QUESTION_ID}
          initialIsBookmarked={false}
        />,
      );

      const button = screen.getByRole('button', { name: '북마크 추가' });

      expect(button).not.toBeDisabled();

      await user.click(button);

      expect(button).toBeDisabled();
    });

    test('북마크 변경 성공 시 변경된 상태를 유지하고 에러 토스트를 표시하지 않는다', async () => {
      mockClientFetch.mockResolvedValueOnce(SUCCESS_204);

      const user = userEvent.setup();

      render(
        <BookmarkQuestionButton
          questionId={QUESTION_ID}
          initialIsBookmarked={false}
        />,
      );

      const button = screen.getByRole('button', { name: '북마크 추가' });

      await user.click(button);

      expect(button).not.toBeDisabled();

      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-label', '북마크 해제');

      expect(toast.error).not.toHaveBeenCalled();
    });

    test('북마크 변경 실패 시 이전 상태로 되돌리고 에러 토스트를 표시한다', async () => {
      mockClientFetch.mockResolvedValueOnce(FAIL_500);

      const user = userEvent.setup();

      render(
        <BookmarkQuestionButton
          questionId={QUESTION_ID}
          initialIsBookmarked={false}
        />,
      );

      const button = screen.getByRole('button', { name: '북마크 추가' });

      await user.click(button);

      expect(button).not.toBeDisabled();

      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-label', '북마크 추가');

      expect(mockClientFetch).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('북마크 변경에 실패했습니다.');
    });

    test('네트워크 오류 발생 시 이전 상태로 되돌리고 에러 토스트를 표시한다', async () => {
      mockClientFetch.mockRejectedValueOnce(new Error());

      const user = userEvent.setup();

      render(
        <BookmarkQuestionButton
          questionId={QUESTION_ID}
          initialIsBookmarked={false}
        />,
      );

      const button = screen.getByRole('button', { name: '북마크 추가' });

      await user.click(button);

      expect(button).not.toBeDisabled();

      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-label', '북마크 추가');

      expect(mockClientFetch).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(
        '네트워크 오류가 발생했습니다.',
        {
          description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
        },
      );
    });
  });
});
