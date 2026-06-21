'use client';

import { prepareLinkProvider } from '@/app/(protected)/setting/account/actions';
import { Button } from '@/components/ui/button';
import type { AccountProvider } from '@/types/account';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
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
    <Button
      variant="link"
      size="sm"
      onClick={handleLinkProvider}
      disabled={isPending}
      className="h-auto px-0 py-2"
    >
      연동하기
    </Button>
  );
}
