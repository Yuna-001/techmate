/** @jest-environment node */

import { getToken } from '@auth/core/jwt';
import { ObjectId } from 'mongodb';
import { cookies, headers } from 'next/headers';

type OAuthAccount = {
  provider: string;
  providerAccountId: string;
};

type SignInCallback = (params: {
  account?: OAuthAccount | null;
  user: unknown;
}) => Promise<boolean | string> | boolean | string;

type CapturedNextAuthConfig = {
  callbacks?: {
    signIn?: SignInCallback;
  };
};

type TestGlobal = typeof globalThis & {
  mockNextAuthConfig?: CapturedNextAuthConfig;
};

const mockGetUser = jest.fn();
const mockFindOneAndDelete = jest.fn();
const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();
const mockCollection = jest.fn();
const mockCookieGet = jest.fn();
const mockCookieDelete = jest.fn();

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn((config: CapturedNextAuthConfig) => {
    (globalThis as TestGlobal).mockNextAuthConfig = config;

    return {
      handlers: {},
      signIn: jest.fn(),
      signOut: jest.fn(),
      auth: jest.fn(),
    };
  }),
}));

jest.mock('@/auth.config', () => ({
  __esModule: true,
  default: {
    providers: [],
    callbacks: {
      authorized: jest.fn(),
      session: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth/adapter', () => ({
  authAdapter: {
    getUser: (...args: unknown[]) => mockGetUser(...args),
  },
}));

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    db: jest.fn(() => ({
      collection: mockCollection,
    })),
  },
}));

jest.mock('@auth/core/jwt', () => ({
  getToken: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn(),
}));

import './auth';

const currentUserId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439012';
const account: OAuthAccount = {
  provider: 'github',
  providerAccountId: 'github-account-id',
};

const callSignIn = async (oauthAccount: OAuthAccount | null = account) => {
  const mockNextAuthConfig = (globalThis as TestGlobal).mockNextAuthConfig;
  const signInCallback = mockNextAuthConfig?.callbacks?.signIn;

  if (!signInCallback) {
    throw new Error('signIn callback is not configured');
  }

  return signInCallback({
    account: oauthAccount,
    user: {},
  });
};

describe('NextAuth signIn callback OAuth 계정 연동', () => {
  beforeEach(() => {
    mockCollection.mockImplementation((collectionName: string) => {
      if (collectionName === 'pendingLinks') {
        return { findOneAndDelete: mockFindOneAndDelete };
      }

      if (collectionName === 'accounts') {
        return { findOne: mockFindOne };
      }

      return { updateOne: mockUpdateOne };
    });

    jest.mocked(headers).mockResolvedValue(new Headers());
    jest.mocked(cookies).mockResolvedValue({
      get: mockCookieGet,
      delete: mockCookieDelete,
    } as unknown as Awaited<ReturnType<typeof cookies>>);
    jest.mocked(getToken).mockResolvedValue({ sub: currentUserId });
    mockGetUser.mockResolvedValue({ id: currentUserId });
    mockCookieGet.mockReturnValue({ value: 'link-token' });
    mockFindOneAndDelete.mockResolvedValue({
      token: 'link-token',
      provider: 'github',
      userId: new ObjectId(currentUserId),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 10 * 1000),
    });
    mockFindOne.mockResolvedValue(null);
  });

  test('OAuth account가 없으면 기존 로그인 흐름을 유지한다', async () => {
    await expect(callSignIn(null)).resolves.toBe(true);
  });

  test('Pending Link 없는 로그아웃 OAuth callback은 일반 로그인 흐름을 유지한다', async () => {
    mockCookieGet.mockReturnValue(undefined);
    jest.mocked(getToken).mockResolvedValue(null);

    await expect(callSignIn()).resolves.toBe(true);
  });

  test('Pending Link 없는 로그인 상태 OAuth callback은 LinkRequired로 이동한다', async () => {
    mockCookieGet.mockReturnValue(undefined);

    await expect(callSignIn()).resolves.toBe(
      '/setting/account?error=LinkRequired',
    );
  });

  test('만료되었거나 유효하지 않은 Pending Link는 LinkExpired로 이동한다', async () => {
    mockFindOneAndDelete.mockResolvedValue(null);

    await expect(callSignIn()).resolves.toBe(
      '/setting/account?error=LinkExpired',
    );
    expect(mockCookieDelete).toHaveBeenCalledWith('account_link_token');
  });

  test('Pending Link가 있지만 현재 세션이 없으면 SessionRequired로 이동한다', async () => {
    jest.mocked(getToken).mockResolvedValue(null);

    await expect(callSignIn()).resolves.toBe('/login?error=SessionRequired');
    expect(mockCookieDelete).toHaveBeenCalledWith('account_link_token');
  });

  test('Pending Link 사용자와 현재 세션 사용자가 다르면 LinkRequired로 이동한다', async () => {
    mockFindOneAndDelete.mockResolvedValue({
      token: 'link-token',
      provider: 'github',
      userId: new ObjectId(otherUserId),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 10 * 1000),
    });

    await expect(callSignIn()).resolves.toBe(
      '/setting/account?error=LinkRequired',
    );
  });

  test('이미 다른 사용자에게 연결된 OAuth 계정은 AlreadyLinked로 이동한다', async () => {
    mockFindOne.mockResolvedValue({
      provider: 'github',
      providerAccountId: 'github-account-id',
      userId: new ObjectId(otherUserId),
    });

    await expect(callSignIn()).resolves.toBe(
      '/setting/account?error=AlreadyLinked',
    );
  });

  test('현재 사용자에게 이미 연결된 OAuth 계정은 AlreadyLinkedToCurrent로 이동한다', async () => {
    mockFindOne.mockResolvedValue({
      provider: 'github',
      providerAccountId: 'github-account-id',
      userId: new ObjectId(currentUserId),
    });

    await expect(callSignIn()).resolves.toBe(
      '/setting/account?error=AlreadyLinkedToCurrent',
    );
  });

  test('아직 연결되지 않은 OAuth 계정은 NextAuth 기본 연결 흐름을 유지한다', async () => {
    await expect(callSignIn()).resolves.toBe(true);
  });
});
