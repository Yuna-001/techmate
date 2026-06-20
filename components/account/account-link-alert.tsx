import { PROVIDER_LABEL } from '@/lib/constants/account-provider';
import type { AccountLinkError, AccountProvider } from '@/types/account';

const ERROR_MESSAGE: Record<AccountLinkError, string> = {
  AlreadyLinked: '이미 다른 사용자 계정에 연결된 소셜 계정입니다.',
  AlreadyLinkedToCurrent: '이미 현재 계정에 연동된 소셜 계정입니다.',
  LinkRequired: '계정 연동 요청을 확인할 수 없습니다. 다시 시도해 주세요.',
  LinkExpired: '계정 연동 요청을 확인할 수 없습니다. 다시 시도해 주세요.',
};

type AccountLinkAlertProps = {
  linkedProvider: AccountProvider | null;
  error: AccountLinkError | null;
  providers: AccountProvider[];
};

export function AccountLinkAlert({
  linkedProvider,
  error,
  providers,
}: AccountLinkAlertProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="break-keep rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {ERROR_MESSAGE[error]}
      </div>
    );
  }

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
