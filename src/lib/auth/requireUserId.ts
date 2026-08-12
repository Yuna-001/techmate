import 'server-only';

import { auth } from '@/auth';
import { authAdapter } from '@/lib/auth/adapter';
import { HttpError } from '@/lib/error';
import { Types } from 'mongoose';

/** 인증된 사용자의 userId를 검증해 반환 (실패 시 HttpError 발생) */
export const requireUserId = async (): Promise<{
  userId: string;
}> => {
  const session = await auth();

  if (!session?.user?.userId) {
    throw new HttpError(401, '로그인이 필요합니다.');
  }

  const userId = session.user.userId;

  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpError(401, '잘못된 사용자 정보입니다.');
  }

  if (!authAdapter.getUser) {
    console.error('authAdapter.getUser is not implemented');
    throw new Error('Internal Server Error');
  }

  const user = await authAdapter.getUser(userId);

  if (!user) {
    throw new HttpError(401, '사용자를 찾을 수 없습니다.');
  }

  return { userId };
};
