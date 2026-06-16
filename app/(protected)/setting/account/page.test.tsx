import type { FetchSuccessResult } from '@/lib/fetch/core';
import { serverFetch } from '@/lib/fetch/server';
import { FAIL_500 } from '@/test/fixtures/fetch';
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

jest.mock('@/components/common/retry-button', () => ({
  RetryButton: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div role="alert">
      <p>{title}</p>
      <p>{description}</p>
    </div>
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

describe('AccountPage', () => {
  test('연동된 provider와 미연동 provider 상태를 렌더링한다', async () => {
    mockServerFetch.mockResolvedValueOnce(createAccountResponse());

    render(await AccountPage());

    expect(screen.getByText('연동된 로그인 방식')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('연동됨')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'github 연동하기' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026년 6월 16일')).toBeInTheDocument();
  });

  test('계정 정보 조회에 실패하면 재시도 안내를 렌더링한다', async () => {
    mockServerFetch.mockResolvedValueOnce(FAIL_500);

    render(await AccountPage());

    expect(screen.getByRole('alert')).toHaveTextContent(
      '계정 정보를 가져오는 데 실패했습니다.',
    );
  });
});
