'use client';

import { IconTooltip } from '@/components/common/icon-tooltip';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <IconTooltip label="로그아웃">
      <Button
        variant="outline"
        size="icon"
        aria-label="로그아웃"
        onClick={handleLogout}
      >
        <LogOut />
      </Button>
    </IconTooltip>
  );
}
