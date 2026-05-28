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
    <Card className="relative transition-colors duration-200 hover:bg-muted/70 dark:hover:bg-accent/80">
      <Link
        href={`/questions/${questionId}`}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="질문 상세 페이지로 이동"
      />

      <CardHeader className="pointer-events-none relative z-10 flex justify-between">
        <CardTitle className="font-normal text-sm leading-relaxed">
          <span className="line-clamp-2 max-sm:line-clamp-3">{content}</span>
        </CardTitle>

        <CardAction className="pointer-events-auto flex items-center gap-2">
          <BookmarkQuestionButton
            questionId={questionId}
            initialIsBookmarked={isBookmarked}
            size={20}
          />
          <DeleteQuestionButton questionId={questionId} size={20} />
        </CardAction>
      </CardHeader>

      <CardContent className="pointer-events-none relative z-10">
        <div className="mr-2">
          <TagList tags={tags} />
        </div>
      </CardContent>
    </Card>
  );
}
