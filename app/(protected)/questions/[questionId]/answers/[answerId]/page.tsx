import { AnswerSection } from '@/components/answer/answer-section';
import { DeleteAnswerButton } from '@/components/answer/delete-answer-button';
import { FeedbackSection } from '@/components/answer/feedback-section';
import { RetryAnswerButton } from '@/components/answer/retry-answer-button';
import { RetryButton } from '@/components/common/retry-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { serverFetch } from '@/lib/fetch/server';
import type { AnswerDetailResponse } from '@/types/answer';
import { notFound } from 'next/navigation';

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ questionId: string; answerId: string }>;
}) {
  const { questionId, answerId } = await params;

  const result = await serverFetch<AnswerDetailResponse>(
    `/api/questions/${questionId}/answers/${answerId}`,
  );

  if (!result.ok) {
    if (result.status === 404) notFound();

    return (
      <div className="flex items-center justify-center min-h-50">
        <RetryButton
          title="답변을 가져오는 데 실패했습니다."
          description="잠시 후 다시 시도해주세요."
        />
      </div>
    );
  }

  const { content: answer, feedback } = result.data;

  return (
    <Card className="flex flex-col gap-8">
      <CardContent className="flex flex-col gap-8">
        <AnswerSection answer={answer} />
        <Separator />
        <FeedbackSection feedback={feedback} />
      </CardContent>
      <CardFooter className="flex gap-3 justify-end flex-wrap">
        <RetryAnswerButton questionId={questionId} />
        <DeleteAnswerButton questionId={questionId} answerId={answerId} />
      </CardFooter>
    </Card>
  );
}
