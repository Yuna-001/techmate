import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { ProviderLinkButton } from './provider-link-button';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('ProviderLinkButton', () => {
  test('클릭하면 provider 연동 OAuth 로그인을 시작한다', async () => {
    const user = userEvent.setup();

    render(<ProviderLinkButton provider="github" />);

    await user.click(screen.getByRole('button', { name: '연동하기' }));

    expect(signIn).toHaveBeenCalledWith('github', {
      callbackUrl: '/setting/account?linked=github',
    });
  });
});
