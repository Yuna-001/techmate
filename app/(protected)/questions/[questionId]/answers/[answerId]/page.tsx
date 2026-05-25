import { DeleteAnswerButton } from '@/components/answer/delete-answer-button';
import { RetryAnswerButton } from '@/components/answer/retry-answer-button';
import { RetryButton } from '@/components/common/retry-button';
import { AnswerSection } from '@/components/feedback/answer-section';
import { FeedbackSection } from '@/components/feedback/feedback-section';
import { serverFetch } from '@/lib/fetch/server';
import type { AnswerResponse } from '@/types/answer';
import { notFound } from 'next/navigation';

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ questionId: string; answerId: string }>;
}) {
  const { questionId, answerId } = await params;

  const result = await serverFetch<AnswerResponse>(
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
    <div className="flex flex-col gap-8">
      <AnswerSection answer={answer} />
      <FeedbackSection feedback={feedback} />
      <div className="flex gap-3">
        <DeleteAnswerButton questionId={questionId} answerId={answerId} />
        <RetryAnswerButton questionId={questionId} />
      </div>
    </div>
  );
}
