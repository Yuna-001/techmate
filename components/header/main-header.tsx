import { HeaderActions } from '@/components/header/header-actions';
import quervuLogo from '@/public/logos/quervu-logo.png';
import Image from 'next/image';
import Link from 'next/link';

export function MainHeader() {
  return (
    <header className="sticky top-0 z-50 w-full px-6 py-3 flex items-center justify-between flex-wrap border-b shadow-md bg-background">
      <Link href="/" className="inline-flex items-center gap-2">
        <Image
          src={quervuLogo}
          alt=""
          width={40}
          height={40}
          priority
          className="h-10 w-auto"
        />
        <span className="font-lexend text-3xl">Quervu</span>
      </Link>
      <HeaderActions />
    </header>
  );
}
