import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCreatedAt } from '@/lib/format/date';
import type { AnswerListItem } from '@/types/answer';
import Link from 'next/link';

export function AnswerPreviewCard({
  questionId,
  answer,
}: {
  questionId: string;
  answer: AnswerListItem;
}) {
  const { answerId, content, score, createdAt } = answer;

  const formattedDate = formatCreatedAt(createdAt);

  return (
    <Link
      href={`/questions/${questionId}/answers/${answerId}`}
      className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      <Card className="h-full gap-0 transition-colors duration-200 hover:bg-muted/70 dark:hover:bg-accent/80">
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-2 text-sm font-normal leading-relaxed text-slate-900 dark:text-slate-100 max-sm:line-clamp-3">
            {content}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex items-center justify-between pt-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formattedDate}
          </span>

          <span className="font-inter text-sm font-bold text-slate-700 dark:text-slate-200">
            {score}점
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
