import { clientFetch } from '@/lib/fetch/client';
import { FAIL_500, SUCCESS_204 } from '@/test/fixtures/fetch';
import type { MockClientFetch } from '@/test/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { DeleteAnswerButton } from './delete-answer-button';

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/lib/fetch/client', () => ({
  clientFetch: jest.fn(),
}));

const mockClientFetch = clientFetch as unknown as MockClientFetch;

const QUESTION_ID = 'q1';
const ANSWER_ID = 'a1';

describe('DeleteAnswerButton', () => {
  const setup = (onSuccess?: () => void) => {
    const user = userEvent.setup();
    render(
      <DeleteAnswerButton
        questionId={QUESTION_ID}
        answerId={ANSWER_ID}
        onSuccess={onSuccess}
      />,
    );

    return { user };
  };

  const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(
      screen.getByRole('button', {
        name: '답변 삭제',
      }),
    );

    return screen.findByRole('alertdialog');
  };

  const getConfirmButton = (dialog: HTMLElement) =>
    within(dialog).getByRole('button', { name: '삭제' });

  const getCancelButton = (dialog: HTMLElement) =>
    within(dialog).getByRole('button', { name: '취소' });

  test('답변 삭제 버튼 클릭 시 AlertDialog가 열린다', async () => {
    const { user } = setup();
    const dialog = await openDialog(user);

    expect(dialog).toBeInTheDocument();
  });

  test('AlertDialogAction 클릭 시 답변 삭제 API를 DELETE로 호출한다', async () => {
    mockClientFetch.mockResolvedValueOnce(SUCCESS_204);

    const { user } = setup();
    const dialog = await openDialog(user);

    await user.click(getConfirmButton(dialog));

    expect(mockClientFetch).toHaveBeenCalledWith(
      `/api/questions/${QUESTION_ID}/answers/${ANSWER_ID}`,
      {
        method: 'DELETE',
        expectNoContent: true,
      },
    );
    expect(mockClientFetch).toHaveBeenCalledTimes(1);
  });

  test('답변 삭제 성공 시 onSuccess 콜백을 호출한다', async () => {
    mockClientFetch.mockResolvedValueOnce(SUCCESS_204);

    const onSuccess = jest.fn();
    const { user } = setup(onSuccess);
    const dialog = await openDialog(user);

    await user.click(getConfirmButton(dialog));

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  test('onSuccess가 없어도 삭제 성공 시 에러가 발생하지 않는다', async () => {
    mockClientFetch.mockResolvedValueOnce(SUCCESS_204);

    const { user } = setup();
    const dialog = await openDialog(user);

    await expect(user.click(getConfirmButton(dialog))).resolves.not.toThrow();
  });

  test('답변 삭제 요청이 실패하면 에러 토스트를 표시한다', async () => {
    mockClientFetch.mockResolvedValueOnce(FAIL_500);

    const onSuccess = jest.fn();
    const { user } = setup(onSuccess);
    const dialog = await openDialog(user);

    await user.click(getConfirmButton(dialog));

    expect(toast.error).toHaveBeenCalledWith('답변 삭제에 실패했습니다.', {
      description: '잠시 후 다시 시도해주세요.',
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('네트워크 오류 발생 시 에러 토스트를 표시한다', async () => {
    mockClientFetch.mockRejectedValueOnce(new Error());

    const onSuccess = jest.fn();
    const { user } = setup(onSuccess);
    const dialog = await openDialog(user);

    await user.click(getConfirmButton(dialog));

    expect(toast.error).toHaveBeenCalledWith('네트워크 오류가 발생했습니다.', {
      description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('취소 버튼을 누르면 답변 삭제 요청을 보내지 않는다', async () => {
    const { user } = setup();
    const dialog = await openDialog(user);

    await user.click(getCancelButton(dialog));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    expect(mockClientFetch).not.toHaveBeenCalled();
  });
});
