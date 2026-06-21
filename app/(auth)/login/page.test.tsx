import { auth } from '@/auth';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import LoginPage from './page';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/components/auth/github-login-button', () => ({
  GitHubLoginButton: () => <button type="button">GitHub 로그인</button>,
}));

jest.mock('@/components/auth/google-login-button', () => ({
  GoogleLoginButton: () => <button type="button">Google 로그인</button>,
}));

jest.mock('@/components/theme/dark-mode-toggle', () => ({
  DarkModeToggle: () => <button type="button">테마 변경</button>,
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

const mockAuth = auth as jest.Mock;
const mockRedirect = redirect as unknown as jest.Mock;

describe('LoginPage', () => {
  test('OAuthAccountNotLinked 에러 안내를 렌더링한다', async () => {
    mockAuth.mockResolvedValueOnce(null);

    render(
      await LoginPage({
        searchParams: Promise.resolve({ error: 'OAuthAccountNotLinked' }),
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      '이미 같은 이메일로 가입된 계정이 있습니다.',
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      '처음 사용한 로그인 방식으로 로그인해 주세요.',
    );
  });

  test('SessionRequired 에러 안내를 렌더링한다', async () => {
    mockAuth.mockResolvedValueOnce(null);

    render(
      await LoginPage({
        searchParams: Promise.resolve({ error: 'SessionRequired' }),
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent('로그인이 필요합니다.');
    expect(screen.getByRole('alert')).toHaveTextContent(
      '다시 로그인한 뒤 계정 연동을 시도해 주세요.',
    );
  });

  test('알 수 없는 error는 알림을 렌더링하지 않는다', async () => {
    mockAuth.mockResolvedValueOnce(null);

    render(
      await LoginPage({
        searchParams: Promise.resolve({ error: 'UnknownError' }),
      }),
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('이미 로그인한 사용자는 홈으로 redirect한다', async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        userId: 'user-id',
      },
    });

    await expect(LoginPage({})).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/');
  });
});
