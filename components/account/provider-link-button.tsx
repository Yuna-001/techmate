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
    <Button
      variant="link"
      size="sm"
      onClick={handleLinkProvider}
      className="h-auto px-0 py-2"
    >
      연동하기
    </Button>
  );
}
