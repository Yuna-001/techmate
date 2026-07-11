import { CreateQuestionButton } from '@/components/question/create-question-button';
import { serverFetch } from '@/lib/fetch/server';
import type { ProfileResponse } from '@/types/profile';

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileResult = await serverFetch<ProfileResponse>('/api/me/profile', {
    cache: 'no-store',
  });

  const hasProfile = !profileResult.ok || profileResult.data.position !== null;

  return (
    <>
      <div className="mt-10 mb-14 flex justify-center sm:mb-24">
        <CreateQuestionButton hasProfile={hasProfile} />
      </div>

      {children}
    </>
  );
}
