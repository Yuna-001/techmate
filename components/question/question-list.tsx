import 'server-only';

import { ResponsivePagination } from '@/components/common/responsive-pagination';
import { RetryButton } from '@/components/common/retry-button';
import { QuestionPreviewCard } from '@/components/question/question-preview-card';
import { serverFetch } from '@/lib/fetch/server';
import type { QuestionListResponse } from '@/types/question';
import { redirect } from 'next/navigation';

const QUESTIONS_PAGE_SIZE = 5;

export async function QuestionList({
  page,
  bookmarkFilter,
}: {
  page: number;
  bookmarkFilter: boolean;
}) {
  const qs = new URLSearchParams({
    limit: String(QUESTIONS_PAGE_SIZE),
    page: String(page),
  });

  if (bookmarkFilter) {
    qs.set('isBookmarked', 'true');
  }

  const result = await serverFetch<QuestionListResponse>(
    `/api/questions?${qs}`,
    {
      cache: 'no-store',
    },
  );

  if (!result.ok || !result.data) {
    return (
      <div className="mt-20">
        <RetryButton
          title="질문 목록을 가져오는 데 실패했습니다."
          description="잠시 후 다시 시도해주세요."
        />
      </div>
    );
  }

  const { items, totalCount, totalPages } = result.data;

  const makeHref = (p: number) => {
    const qs = new URLSearchParams({ page: String(p) });
    if (bookmarkFilter) qs.set('bookmarked', '1');
    return `/?${qs.toString()}`;
  };

  if (totalPages > 0 && page > totalPages) {
    redirect(makeHref(totalPages));
  }

  return (
    <>
      <p className="text-right text-sm text-muted-foreground">
        총 <span className="font-medium text-foreground">{totalCount}</span>개
      </p>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {bookmarkFilter
            ? '아직 북마크한 질문이 없습니다.'
            : '아직 생성된 질문이 없습니다.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {items.map((item) => (
            <li key={item.questionId}>
              <QuestionPreviewCard question={item} />
            </li>
          ))}
        </ul>
      )}

      <ResponsivePagination
        page={page}
        totalPages={totalPages}
        makeHref={makeHref}
      />
    </>
  );
}
