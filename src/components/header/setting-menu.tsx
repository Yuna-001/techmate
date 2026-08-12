'use client';

import { IconTooltip } from '@/components/common/icon-tooltip';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Shield, User } from 'lucide-react';
import Link from 'next/link';

export function SettingMenu() {
  return (
    <DropdownMenu>
      <IconTooltip label="설정">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="설정">
            <Settings />
          </Button>
        </DropdownMenuTrigger>
      </IconTooltip>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(e) => {
          e.preventDefault(); // 닫힐 때 트리거로 포커스가 돌아가는 걸 막음
        }}
      >
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/setting/profile" className="flex items-center gap-2">
            <User />
            프로필
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/setting/account" className="flex items-center gap-2">
            <Shield />
            계정
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
