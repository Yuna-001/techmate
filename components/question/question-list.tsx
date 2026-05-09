import 'server-only';

import { RetryButton } from '@/components/common/retry-button';
import { serverFetch } from '@/lib/fetch/server';
import type { QuestionListResponse } from '@/types/question';
import { QuestionPreviewCard } from './question-preview-card';

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
      <RetryButton
        title="질문 목록을 가져오는 데 실패했습니다."
        description="잠시 후 다시 시도해주세요."
      />
    );
  }

  const { items, totalCount } = result.data;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">질문 목록</h2>
          <p className="text-sm text-muted-foreground">
            총 <span className="font-medium text-foreground">{totalCount}</span>
            개
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-6">
        {items.map((item) => (
          <li key={item.questionId}>
            <QuestionPreviewCard question={item} />
          </li>
        ))}
      </ul>

      {/**페이지네이션 컴포넌트 추가 필요 */}
    </section>
  );
}
