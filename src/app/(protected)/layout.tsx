import { MainHeader } from '@/components/header/main-header';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MainHeader />
      <main className="w-full px-6 sm:px-12 md:px-24 py-8 sm:py-16 max-w-5xl mx-auto">
        {children}
      </main>
    </>
  );
}
