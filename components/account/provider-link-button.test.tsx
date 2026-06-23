import { createDeferred } from '@/test/utils/async';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProviderLinkButton } from './provider-link-button';

const prepareLinkProvider = jest.fn();

jest.mock('@/app/(protected)/setting/account/actions', () => ({
  prepareLinkProvider: (...args: unknown[]) => prepareLinkProvider(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('ProviderLinkButton', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.mocked(useRouter).mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);
    prepareLinkProvider.mockResolvedValue({ ok: true });
  });

  test('Pending Link 생성 성공 후 provider 연동 OAuth 로그인을 시작한다', async () => {
    const user = userEvent.setup();

    render(<ProviderLinkButton provider="github" />);

    await user.click(screen.getByRole('button', { name: '연동하기' }));

    expect(prepareLinkProvider).toHaveBeenCalledWith('github');
    expect(signIn).toHaveBeenCalledWith('github', {
      callbackUrl: '/setting/account?linked=github',
    });
  });

  test('Pending Link 생성 실패 시 OAuth 로그인을 시작하지 않는다', async () => {
    const user = userEvent.setup();
    prepareLinkProvider.mockResolvedValue({ ok: false, error: 'Unknown' });

    render(<ProviderLinkButton provider="github" />);

    await user.click(screen.getByRole('button', { name: '연동하기' }));

    expect(signIn).not.toHaveBeenCalled();
  });

  test('세션이 없으면 로그인 페이지로 이동한다', async () => {
    const user = userEvent.setup();
    prepareLinkProvider.mockResolvedValue({
      ok: false,
      error: 'SessionRequired',
    });

    render(<ProviderLinkButton provider="github" />);

    await user.click(screen.getByRole('button', { name: '연동하기' }));

    expect(signIn).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/login?error=SessionRequired');
  });

  test('서버 액션 호출이 실패하면 로그인 페이지로 이동한다', async () => {
    const user = userEvent.setup();
    prepareLinkProvider.mockRejectedValue(new Error('action error'));

    render(<ProviderLinkButton provider="github" />);

    await user.click(screen.getByRole('button', { name: '연동하기' }));

    expect(signIn).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/login?error=SessionRequired');
  });

  test('Pending Link 생성 중 버튼을 비활성화한다', async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<{ ok: true }>();

    prepareLinkProvider.mockReturnValue(deferred.promise);

    render(<ProviderLinkButton provider="github" />);

    const button = screen.getByRole('button', { name: '연동하기' });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    deferred.resolve({ ok: true });
  });
});
