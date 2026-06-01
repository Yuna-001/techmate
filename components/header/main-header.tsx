import { HeaderActions } from '@/components/header/header-actions';
import Image from 'next/image';
import Link from 'next/link';

export function MainHeader() {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 py-2 shadow-md">
      <Link
        href="/"
        className="inline-flex min-w-0 shrink-0 items-center gap-2"
      >
        <Image
          src="/logos/quervu-logo.png"
          alt=""
          width={40}
          height={40}
          priority
          className="h-8 sm:h-10 w-auto dark:brightness-0 dark:invert"
        />
        <span className="font-lexend text-2xl sm:text-3xl">Quervu</span>
      </Link>
      <HeaderActions />
    </header>
  );
}
