/** @jest-environment node */

import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { prepareLinkProvider } from './actions';

const deleteMany = jest.fn();
const insertOne = jest.fn();
const setCookie = jest.fn();
const requireUserId = jest.fn();

jest.mock('@/lib/auth/requireUserId', () => ({
  requireUserId: (...args: unknown[]) => requireUserId(...args),
}));

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        deleteMany,
        insertOne,
      })),
    })),
  },
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('prepareLinkProvider', () => {
  beforeEach(() => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValue('link-token');
    jest.mocked(cookies).mockResolvedValue({
      set: setCookie,
    } as unknown as Awaited<ReturnType<typeof cookies>>);
    requireUserId.mockResolvedValue({
      userId: '507f1f77bcf86cd799439011',
    });
    deleteMany.mockResolvedValue({ acknowledged: true, deletedCount: 0 });
    insertOne.mockResolvedValue({ acknowledged: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('로그인 사용자의 Pending Link를 생성하고 cookie를 설정한다', async () => {
    const result = await prepareLinkProvider('github');

    expect(result).toEqual({ ok: true });
    expect(deleteMany).toHaveBeenCalledWith({
      userId: new ObjectId('507f1f77bcf86cd799439011'),
      provider: 'github',
    });
    expect(insertOne).toHaveBeenCalledWith({
      token: 'link-token',
      provider: 'github',
      userId: new ObjectId('507f1f77bcf86cd799439011'),
      createdAt: expect.any(Date),
      expiresAt: expect.any(Date),
    });
    expect(deleteMany.mock.invocationCallOrder[0]).toBeLessThan(
      insertOne.mock.invocationCallOrder[0],
    );

    const pendingLink = insertOne.mock.calls[0][0];
    expect(
      pendingLink.expiresAt.getTime() - pendingLink.createdAt.getTime(),
    ).toBe(60 * 10 * 1000);

    expect(setCookie).toHaveBeenCalledWith('account_link_token', 'link-token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 60 * 10,
    });
  });

  test('허용되지 않은 provider이면 Pending Link를 생성하지 않는다', async () => {
    const result = await prepareLinkProvider('twitter');

    expect(result).toEqual({ ok: false, error: 'InvalidProvider' });
    expect(requireUserId).not.toHaveBeenCalled();
    expect(deleteMany).not.toHaveBeenCalled();
    expect(insertOne).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });

  test('로그인 사용자가 없으면 Pending Link를 생성하지 않는다', async () => {
    requireUserId.mockRejectedValue(new Error('로그인이 필요합니다.'));

    const result = await prepareLinkProvider('github');

    expect(result).toEqual({ ok: false, error: 'SessionRequired' });
    expect(deleteMany).not.toHaveBeenCalled();
    expect(insertOne).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });

  test('Pending Link 생성 중 오류가 발생하면 Unknown을 반환한다', async () => {
    insertOne.mockRejectedValue(new Error('db error'));

    const result = await prepareLinkProvider('github');

    expect(result).toEqual({ ok: false, error: 'Unknown' });
    expect(deleteMany).toHaveBeenCalledWith({
      userId: new ObjectId('507f1f77bcf86cd799439011'),
      provider: 'github',
    });
    expect(insertOne).toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });
});
