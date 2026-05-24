import { AnswerPreviewCard } from '@/components/answer/answer-preview-card';
import type { AnswerListItem } from '@/types/answer';

export function AnswerList({
  questionId,
  items,
}: {
  questionId: string;
  items: AnswerListItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-700">
        아직 작성한 답변이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.answerId}>
          <AnswerPreviewCard questionId={questionId} answer={item} />
        </li>
      ))}
    </ul>
  );
}
