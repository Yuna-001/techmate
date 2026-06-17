import { PROVIDER_LABEL } from '@/lib/constants/account-provider';
import type { AccountProvider } from '@/types/account';

type AccountLinkResultAlertProps = {
  linkedProvider: AccountProvider | null;
  providers: AccountProvider[];
};

export function AccountLinkResultAlert({
  linkedProvider,
  providers,
}: AccountLinkResultAlertProps) {
  if (!linkedProvider) {
    return null;
  }

  const hasLinkedProvider = providers.includes(linkedProvider);

  return (
    <div
      role="alert"
      className={
        hasLinkedProvider
          ? 'break-keep rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary'
          : 'break-keep rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'
      }
    >
      {hasLinkedProvider
        ? `${PROVIDER_LABEL[linkedProvider]} 계정 연동이 완료되었습니다.`
        : `연동에 실패했습니다. ${PROVIDER_LABEL[linkedProvider]} 계정을 확인한 뒤 다시 시도해 주세요.`}
    </div>
  );
}
