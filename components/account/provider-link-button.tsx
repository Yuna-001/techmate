'use client';

import { Button } from '@/components/ui/button';
import type { AccountProvider } from '@/types/account';
import { signIn } from 'next-auth/react';

type ProviderLinkButtonProps = {
  provider: AccountProvider;
};

export function ProviderLinkButton({ provider }: ProviderLinkButtonProps) {
  const handleLinkProvider = () => {
    signIn(provider, {
      callbackUrl: `/setting/account?linked=${provider}`,
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLinkProvider}>
      연동하기
    </Button>
  );
}
