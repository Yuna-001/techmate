import type { FetchSuccessResult } from '@/lib/fetch/core';
import { serverFetch } from '@/lib/fetch/server';
import type { MockClientFetch } from '@/test/types';
import type { AccountResponse } from '@/types/account';
import { render, screen } from '@testing-library/react';
import AccountPage from './page';

jest.mock('@/lib/fetch/server', () => ({
  serverFetch: jest.fn(),
}));

jest.mock('@/components/account/delete-account-button', () => ({
  DeleteAccountButton: () => <button type="button">회원 탈퇴</button>,
}));

jest.mock('@/components/account/provider-link-button', () => ({
  ProviderLinkButton: ({ provider }: { provider: string }) => (
    <button type="button">{provider} 연동하기</button>
  ),
}));

const mockServerFetch = serverFetch as unknown as MockClientFetch;

const createAccountResponse = (
  overrides: Partial<AccountResponse> = {},
): FetchSuccessResult<AccountResponse> => ({
  ok: true,
  status: 200,
  data: {
    providers: ['google'],
    createdAt: '2026-06-16T00:00:00.000Z',
    ...overrides,
  },
});

describe('AccountPage OAuth link errors', () => {
  test('AlreadyLinked 에러 안내를 렌더링한다', async () => {
    mockServerFetch.mockResolvedValueOnce(createAccountResponse());

    render(
      await AccountPage({
        searchParams: Promise.resolve({ error: 'AlreadyLinked' }),
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      '이미 다른 사용자 계정에 연결된 소셜 계정입니다.',
    );
  });

  test('AlreadyLinkedToCurrent 에러 안내를 렌더링한다', async () => {
    mockServerFetch.mockResolvedValueOnce(createAccountResponse());

    render(
      await AccountPage({
        searchParams: Promise.resolve({ error: 'AlreadyLinkedToCurrent' }),
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      '이미 현재 계정에 연동된 소셜 계정입니다.',
    );
  });

  test.each(['LinkRequired', 'LinkExpired'])(
    '%s 에러 안내를 렌더링한다',
    async (error) => {
      mockServerFetch.mockResolvedValueOnce(createAccountResponse());

      render(
        await AccountPage({
          searchParams: Promise.resolve({ error }),
        }),
      );

      expect(screen.getByRole('alert')).toHaveTextContent(
        '계정 연동 요청을 확인할 수 없습니다. 다시 시도해 주세요.',
      );
    },
  );

  test('error와 linked가 같이 있으면 error 안내를 우선 렌더링한다', async () => {
    mockServerFetch.mockResolvedValueOnce(
      createAccountResponse({
        providers: ['google', 'github'],
      }),
    );

    render(
      await AccountPage({
        searchParams: Promise.resolve({
          linked: 'github',
          error: 'LinkRequired',
        }),
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      '계정 연동 요청을 확인할 수 없습니다. 다시 시도해 주세요.',
    );
    expect(screen.getByRole('alert')).not.toHaveTextContent(
      'GitHub 계정 연동이 완료되었습니다.',
    );
  });

  test('알 수 없는 error는 알림을 렌더링하지 않는다', async () => {
    mockServerFetch.mockResolvedValueOnce(createAccountResponse());

    render(
      await AccountPage({
        searchParams: Promise.resolve({ error: 'UnknownError' }),
      }),
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
