import { BookmarkedQuestionFilter } from '@/components/bookmark/bookmarked-question-filter';
import { CreateQuestionButton } from '@/components/question/create-question-button';
import { QuestionList } from '@/components/question/question-list';
import { QuestionListSkeleton } from '@/components/question/question-list-skeleton';
import { serverFetch } from '@/lib/fetch/server';
import type { ProfileResponse } from '@/types/profile';
import { Suspense } from 'react';

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
      <div className="flex justify-center mt-10 mb-10 sm:mb-24">
        <CreateQuestionButton hasProfile={hasProfile} />
      </div>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">질문 목록</h2>
          <BookmarkedQuestionFilter />
        </div>

        <Suspense fallback={<QuestionListSkeleton />}>
          <QuestionList page={page} bookmarkFilter={bookmarkFilter} />
        </Suspense>
      </section>
    </>
  );
}
