import { BookmarkedQuestionFilter } from '@/components/bookmark/bookmarked-question-filter';
import { QuestionList } from '@/components/question/question-list';
import { QuestionListSkeleton } from '@/components/question/question-list-skeleton';
import { Suspense } from 'react';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; bookmarked?: string }>;
}) {
  const { page: pageParam, bookmarked: bookmarkFilterParam } =
    await searchParams;
  const parsedPage = Number(pageParam ?? 1);
  const page = Number.isFinite(parsedPage) ? parsedPage : 1;
  const bookmarkFilter = bookmarkFilterParam === '1';

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">질문 목록</h2>
        <BookmarkedQuestionFilter />
      </div>

      <Suspense fallback={<QuestionListSkeleton />}>
        <QuestionList page={page} bookmarkFilter={bookmarkFilter} />
      </Suspense>
    </section>
  );
}
