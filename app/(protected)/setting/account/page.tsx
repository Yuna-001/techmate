import { AccountJoinedAtSection } from '@/components/account/account-joined-at-section';
import { AccountLinkResultAlert } from '@/components/account/account-link-result-alert';
import { DeleteAccountSection } from '@/components/account/delete-account-section';
import { LinkedProvidersSection } from '@/components/account/linked-providers-section';
import { RetryButton } from '@/components/common/retry-button';
import { Separator } from '@/components/ui/separator';
import { serverFetch } from '@/lib/fetch/server';
import type {
  AccountLinkError,
  AccountProvider,
  AccountResponse,
} from '@/types/account';

type AccountPageProps = {
  searchParams?: Promise<{
    linked?: string | string[];
    error?: string | string[];
  }>;
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

const getLinkedProvider = (
  linked: string | string[] | undefined,
): AccountProvider | null => {
  if (typeof linked !== 'string') {
    return null;
  }

  return linked === 'google' || linked === 'github' ? linked : null;
};

const getAccountLinkError = (
  error: string | string[] | undefined,
): AccountLinkError | null => {
  if (typeof error !== 'string') {
    return null;
  }

  return error === 'AlreadyLinked' ||
    error === 'AlreadyLinkedToCurrent' ||
    error === 'LinkRequired' ||
    error === 'LinkExpired'
    ? error
    : null;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const linkedProvider = getLinkedProvider(params?.linked);
  const linkError = getAccountLinkError(params?.error);
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
    <div className="flex flex-col gap-8">
      <AccountLinkResultAlert
        linkedProvider={linkedProvider}
        error={linkError}
        providers={providers}
      />
      <LinkedProvidersSection providers={providers} />
      <AccountJoinedAtSection joinedAt={joinedAt} />
      <Separator className="my-4" />
      <DeleteAccountSection />
    </div>
  );
}
