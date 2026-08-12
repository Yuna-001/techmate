import { clientFetch } from '@/lib/fetch/client';
import { FAIL_500, SUCCESS_204 } from '@/test/fixtures/fetch';
import type { MockClientFetch } from '@/test/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { DeleteAccountButton } from './delete-account-button';

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/lib/fetch/client', () => ({
  clientFetch: jest.fn(),
}));

const mockClientFetch = clientFetch as unknown as MockClientFetch;

describe('DeleteAccount', () => {
  const setup = () => {
    const user = userEvent.setup();
    render(<DeleteAccountButton />);

    return { user };
  };

  const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(
      screen.getByRole('button', {
        name: '회원 탈퇴',
      }),
    );

    return screen.findByRole('alertdialog');
  };

  const getConfirmButton = (dialog: HTMLElement) =>
    within(dialog).getByRole('button', {
      name: '회원 탈퇴',
    });

  const getCancelButton = (dialog: HTMLElement) =>
    within(dialog).getByRole('button', {
      name: '취소',
    });

  test('회원 탈퇴 버튼 클릭 시 AlertDialog가 열린다', async () => {
    const { user } = setup();
    const dialog = await openDialog(user);

    expect(dialog).toBeInTheDocument();
  });

  test('AlertDialogAction 클릭 시 계정 삭제 API를 DELETE로 호출한다', async () => {
    mockClientFetch.mockResolvedValueOnce(SUCCESS_204);

    const { user } = setup();
    const dialog = await openDialog(user);

    await user.click(getConfirmButton(dialog));

    expect(mockClientFetch).toHaveBeenCalledWith('/api/me', {
      method: 'DELETE',
      expectNoContent: true,
    });
    expect(mockClientFetch).toHaveBeenCalledTimes(1);
  });

  test('회원 탈퇴 요청이 성공하면 로그아웃되며 로그인 페이지로 이동한다', async () => {
    mockClientFetch.mockResolvedValueOnce(SUCCESS_204);

    const { user } = setup();
    const dialog = await openDialog(user);

    await user.click(getConfirmButton(dialog));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });

  test('회원 탈퇴 요청이 실패하면 에러 토스트를 표시한다', async () => {
    mockClientFetch.mockResolvedValueOnce(FAIL_500);

    const { user } = setup();
    const dialog = await openDialog(user);

    await user.click(getConfirmButton(dialog));

    expect(toast.error).toHaveBeenCalledWith('회원 탈퇴에 실패했습니다.');
  });

  test('네트워크 오류 발생 시 에러 토스트를 표시한다', async () => {
    mockClientFetch.mockRejectedValueOnce(new Error());

    const { user } = setup();
    const dialog = await openDialog(user);

    await user.click(getConfirmButton(dialog));

    expect(toast.error).toHaveBeenCalledWith('네트워크 오류가 발생했습니다.', {
      description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
    });
  });

  test('취소 버튼을 누르면 회원 탈퇴 요청을 보내지 않는다', async () => {
    const { user } = setup();
    const dialog = await openDialog(user);

    await user.click(getCancelButton(dialog));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    expect(mockClientFetch).not.toHaveBeenCalled();
  });
});
