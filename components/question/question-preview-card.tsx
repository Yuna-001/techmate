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
    <Card className="relative transition-colors hover:bg-accent/25">
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
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            size={20}
          />
          <DeleteQuestionButton
            questionId={questionId}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            size={20}
          />
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
