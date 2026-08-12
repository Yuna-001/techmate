'use client';

import { prepareLinkProvider } from '@/app/(protected)/setting/account/actions';
import { LoadingButton } from '@/components/common/loading-button';
import type { AccountProvider } from '@/types/account';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ProviderLinkButtonProps = {
  provider: AccountProvider;
};

export function ProviderLinkButton({ provider }: ProviderLinkButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLinkProvider = async () => {
    setIsPending(true);

    try {
      const result = await prepareLinkProvider(provider);

      if (!result.ok) {
        if (result.error === 'SessionRequired') {
          router.push('/login?error=SessionRequired');
          return;
        }

        setIsPending(false);
        return;
      }

      await signIn(provider, {
        callbackUrl: `/setting/account?linked=${provider}`,
      });
    } catch {
      router.push('/login?error=SessionRequired');
    }
  };

  return (
    <LoadingButton
      variant="link"
      size="sm"
      onClick={handleLinkProvider}
      isLoading={isPending}
      loadingText={null}
      aria-label="연동하기"
      className="min-h-9 px-0 py-2"
    >
      연동하기
    </LoadingButton>
  );
}
