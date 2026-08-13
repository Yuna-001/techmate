import { Skeleton } from '@/components/ui/skeleton';

const QUESTION_LIST_SKELETON_COUNT = 5;

export function QuestionListSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="질문 목록 로딩 중">
      <div className="flex justify-end">
        <Skeleton className="h-5 w-14" />
      </div>

      <div className="flex flex-col gap-6">
        {Array.from({ length: QUESTION_LIST_SKELETON_COUNT }).map((_, idx) => (
          <Skeleton key={idx} className="h-44 w-full sm:h-32" />
        ))}
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-9 w-30 sm:w-64" />
      </div>
    </div>
  );
}
