import { DeleteAccountButton } from '@/components/account/delete-account-button';
import { RetryButton } from '@/components/common/retry-button';
import { Label } from '@/components/ui/label';
import { serverFetch } from '@/lib/fetch/server';
import type { AccountProvider, AccountResponse } from '@/types/account';

const PROVIDER_LABEL: Record<AccountProvider, string> = {
  github: 'GitHub',
  google: 'Google',
};

const PROVIDERS = Object.keys(PROVIDER_LABEL) as AccountProvider[];

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

  const { createdAt, providers } = result.data;
  const joinedAt = getJoinedAtLabel(createdAt);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-4">
        <Label
          id="providers-label"
          className="pt-1 text-sm text-muted-foreground"
        >
          연동된 로그인 방식
        </Label>
        <div aria-labelledby="providers-label" className="flex flex-col gap-2">
          {PROVIDERS.map((provider) => {
            const isLinked = providers.includes(provider);

            return (
              <div
                key={provider}
                className="flex items-center justify-between gap-4 rounded-md border px-3 py-2"
              >
                <span className="text-base font-medium md:text-sm">
                  {PROVIDER_LABEL[provider]}
                </span>
                <span
                  className={
                    isLinked
                      ? 'text-sm font-medium text-primary'
                      : 'text-sm text-muted-foreground'
                  }
                >
                  {isLinked ? '연동됨' : '연동 필요'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:items-center sm:gap-4">
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
