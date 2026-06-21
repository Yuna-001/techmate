import { ProviderLinkButton } from '@/components/account/provider-link-button';
import { PROVIDER_LABEL, PROVIDERS } from '@/lib/constants/account-provider';
import type { AccountProvider } from '@/types/account';

type LinkedProvidersSectionProps = {
  providers: AccountProvider[];
};

export function LinkedProvidersSection({
  providers,
}: LinkedProvidersSectionProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <p id="providers-label" className="pt-1 text-sm text-muted-foreground">
        연동된 로그인 방식
      </p>
      <div aria-labelledby="providers-label" className="flex flex-col gap-2">
        {PROVIDERS.map((provider) => {
          const isLinked = providers.includes(provider);

          return (
            <div
              key={provider}
              className="flex min-h-12 items-center justify-between gap-4 rounded-md border px-3 py-2"
            >
              <span className="font-semibold text-sm">
                {PROVIDER_LABEL[provider]}
              </span>
              {isLinked ? (
                <span className="py-2 text-sm font-normal text-muted-foreground">
                  연동됨
                </span>
              ) : (
                <ProviderLinkButton provider={provider} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
