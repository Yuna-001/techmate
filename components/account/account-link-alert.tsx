import { PROVIDER_LABEL } from '@/lib/constants/account-provider';
import { cn } from '@/lib/utils';
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
  const baseClass = 'break-keep rounded-md border px-3 py-2 text-sm';
  const errorClass = 'border-destructive/30 bg-destructive/10 text-destructive';
  const successClass = 'border-primary/30 bg-primary/10 text-primary';

  if (error) {
    return (
      <div role="alert" className={cn(baseClass, errorClass)}>
        {ERROR_MESSAGE[error]}
      </div>
    );
  }

  if (!linkedProvider) {
    if (providers.includes('github')) {
      return null;
    }

    return (
      <div className="space-y-1 break-keep rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
        <p>현재 브라우저에 로그인된 GitHub 계정이 연동됩니다.</p>
        <p>
          다른 GitHub 계정을 연동하려면 GitHub에서 먼저 계정을 전환해 주세요.
        </p>
      </div>
    );
  }

  const hasLinkedProvider = providers.includes(linkedProvider);

  return (
    <div
      role="alert"
      className={cn(baseClass, hasLinkedProvider ? successClass : errorClass)}
    >
      {hasLinkedProvider
        ? `${PROVIDER_LABEL[linkedProvider]} 계정 연동이 완료되었습니다.`
        : `연동에 실패했습니다. ${PROVIDER_LABEL[linkedProvider]} 계정을 확인한 뒤 다시 시도해 주세요.`}
    </div>
  );
}
