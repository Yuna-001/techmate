import { BookmarkQuestionButton } from '@/components/bookmark/bookmark-question-button';
import { TagList } from '@/components/common/tag-list';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { QuestionListItem } from '@/types/question';
import Link from 'next/link';
import { DeleteQuestionButton } from './delete-question-button';

export function QuestionPreviewCard({
  question,
}: {
  question: QuestionListItem;
}) {
  const { questionId, content, tags, isBookmarked } = question;

  return (
    <Card className="relative transition-colors duration-200 hover:bg-muted/70 max-sm:gap-4 max-sm:py-5 dark:hover:bg-accent/80">
      <Link
        href={`/questions/${questionId}`}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="질문 상세 페이지로 이동"
      />

      <CardHeader className="pointer-events-none relative z-10 max-sm:px-4">
        <CardTitle className="min-w-0 font-normal text-sm leading-relaxed">
          <span className="line-clamp-3 sm:line-clamp-2">{content}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pointer-events-none relative z-10 flex items-center justify-between gap-3 max-sm:px-4">
        <div className="min-w-0 flex-1">
          <TagList tags={tags} />
        </div>
        <CardAction className="pointer-events-auto flex shrink-0 items-center gap-2 max-sm:self-end">
          <BookmarkQuestionButton
            questionId={questionId}
            initialIsBookmarked={isBookmarked}
            size={20}
          />
          <DeleteQuestionButton questionId={questionId} size={20} />
        </CardAction>
      </CardContent>
    </Card>
  );
}
