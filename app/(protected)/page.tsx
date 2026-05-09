import { CreateQuestionButton } from '@/components/question/create-question-button';
import { QuestionList } from '@/components/question/question-list';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; bookmarked?: string }>;
}) {
  const { page: pageParam, bookmarked: bookmarkFilterParam } =
    await searchParams;
  const page = Number(pageParam ?? 1);
  const bookmarkFilter = bookmarkFilterParam === '1';

  return (
    <>
      <CreateQuestionButton />
      <QuestionList page={page} bookmarkFilter={bookmarkFilter} />
    </>
  );
}
