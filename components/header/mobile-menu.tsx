'use client';

import { IconTooltip } from '@/components/common/icon-tooltip';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LogOut, Menu, Moon, Shield, Sun, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function MobileMenu() {
  const { resolvedTheme, setTheme } = useTheme();

  const handleToggleMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <Sheet>
      <IconTooltip label="메뉴">
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="메뉴 열기"
            className="sm:hidden"
          >
            <Menu />
          </Button>
        </SheetTrigger>
      </IconTooltip>
      <SheetContent side="right" className="w-72 max-w-[calc(100vw-2rem)]">
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4">
          <SheetClose asChild>
            <Button
              asChild
              variant="ghost"
              className="h-10 justify-start gap-2 px-3"
            >
              <Link href="/setting/profile">
                <User />
                프로필
              </Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              asChild
              variant="ghost"
              className="h-10 justify-start gap-2 px-3"
            >
              <Link href="/setting/account">
                <Shield />
                계정
              </Link>
            </Button>
          </SheetClose>
          <Button
            variant="ghost"
            className="h-10 justify-start gap-2 px-3"
            onClick={handleToggleMode}
          >
            <Moon className="dark:hidden" />
            <Sun className="hidden dark:block" />
            테마 전환
          </Button>
          <Button
            variant="ghost"
            className="h-10 justify-start gap-2 px-3"
            onClick={handleLogout}
          >
            <LogOut />
            로그아웃
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
