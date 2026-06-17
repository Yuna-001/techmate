import { PROVIDER_LABEL, PROVIDERS } from '@/lib/constants/account-provider';
import { ProviderLinkButton } from '@/components/account/provider-link-button';
import { Label } from '@/components/ui/label';
import type { AccountProvider } from '@/types/account';

type LinkedProvidersSectionProps = {
  providers: AccountProvider[];
};

export function LinkedProvidersSection({
  providers,
}: LinkedProvidersSectionProps) {
  return (
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
              className="flex min-h-12 items-center justify-between gap-4 rounded-md border px-3 py-2"
            >
              <span className="text-base font-medium md:text-sm">
                {PROVIDER_LABEL[provider]}
              </span>
              {isLinked ? (
                <span className="text-sm font-normal text-muted-foreground">
                  연동됨
                </span>
              ) : (
                <ProviderLinkButton provider={provider} />
              )}
            </div>
          );
        })}
        {providers.includes('github') || (
          <div className="space-y-1 break-keep rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            <p>현재 브라우저에 로그인된 GitHub 계정이 연동됩니다.</p>
            <p>
              다른 GitHub 계정을 연동하려면 GitHub에서 먼저 계정을 전환해
              주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
