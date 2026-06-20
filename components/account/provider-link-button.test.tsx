import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { ProviderLinkButton } from './provider-link-button';

const prepareLinkProvider = jest.fn();

jest.mock('@/app/(protected)/setting/account/actions', () => ({
  prepareLinkProvider: (...args: unknown[]) => prepareLinkProvider(...args),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('ProviderLinkButton', () => {
  beforeEach(() => {
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
    prepareLinkProvider.mockResolvedValue({ ok: false });

    render(<ProviderLinkButton provider="github" />);

    await user.click(screen.getByRole('button', { name: '연동하기' }));

    expect(signIn).not.toHaveBeenCalled();
  });

  test('Pending Link 생성 중 버튼을 비활성화한다', async () => {
    const user = userEvent.setup();
    let resolvePrepareLinkProvider: (value: { ok: true }) => void;
    prepareLinkProvider.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePrepareLinkProvider = resolve;
        }),
    );

    render(<ProviderLinkButton provider="github" />);

    const button = screen.getByRole('button', { name: '연동하기' });
    await user.click(button);

    expect(button).toBeDisabled();

    resolvePrepareLinkProvider!({ ok: true });
  });
});
