import { DeleteAccountButton } from '@/components/account/delete-account-button';
import { RetryButton } from '@/components/common/retry-button';
import { Label } from '@/components/ui/label';
import { serverFetch } from '@/lib/fetch/server';
import type { AccountProvider, AccountResponse } from '@/types/account';

const PROVIDER_LABEL: Record<AccountProvider, string> = {
  github: 'GitHub',
  google: 'Google',
};

const getProviderLabel = (provider: AccountProvider | null) => {
  if (!provider) {
    return '알 수 없음';
  }

  return PROVIDER_LABEL[provider];
};

const getJoinedAtLabel = (createdAt: string | null) => {
  if (!createdAt) {
    return '알 수 없음';
  }

  return new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default async function AccountPage() {
  const result = await serverFetch<AccountResponse>('/api/me', {
    cache: 'no-store',
  });

  if (!result.ok) {
    return (
      <div className="my-10">
        <RetryButton
          title="계정 정보를 가져오는 데 실패했습니다."
          description="잠시 후 다시 시도해주세요."
        />
      </div>
    );
  }

  const { provider, createdAt } = result.data;
  const providerLabel = getProviderLabel(provider);
  const joinedAt = getJoinedAtLabel(createdAt);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-1 sm:grid-cols-[5rem_1fr] sm:items-center sm:gap-4">
        <Label id="provider-label" className="text-sm text-muted-foreground">
          로그인 방식
        </Label>
        <div
          aria-labelledby="provider-label"
          className="text-base font-medium md:text-sm"
        >
          {providerLabel}
        </div>
      </div>
      <div className="grid gap-1 sm:grid-cols-[5rem_1fr] sm:items-center sm:gap-4">
        <Label id="created-at-label" className="text-sm text-muted-foreground">
          가입일
        </Label>
        <div
          aria-labelledby="created-at-label"
          className="text-base font-medium md:text-sm"
        >
          {joinedAt}
        </div>
      </div>
      <div className="mt-5 flex flex-col items-start gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium">회원 탈퇴</p>
          <p className="text-sm text-muted-foreground break-keep">
            탈퇴 시 계정과 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>
        </div>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
