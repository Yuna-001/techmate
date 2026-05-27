import { CreateQuestionButton } from '@/components/question/create-question-button';
import { QuestionList } from '@/components/question/question-list';
import { serverFetch } from '@/lib/fetch/server';
import type { ProfileResponse } from '@/types/profile';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; bookmarked?: string }>;
}) {
  const { page: pageParam, bookmarked: bookmarkFilterParam } =
    await searchParams;
  const page = Number(pageParam ?? 1);
  const bookmarkFilter = bookmarkFilterParam === '1';

  const profileResult = await serverFetch<ProfileResponse>('/api/me/profile', {
    cache: 'no-store',
  });
  const hasProfile = !profileResult.ok || profileResult.data.position !== null;

  return (
    <>
      <div className="flex justify-center mt-10 mb-24">
        <CreateQuestionButton hasProfile={hasProfile} />
      </div>
      <QuestionList page={page} bookmarkFilter={bookmarkFilter} />
    </>
  );
}
