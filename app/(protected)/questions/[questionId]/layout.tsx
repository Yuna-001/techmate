import { AnswerListDialog } from '@/components/answer/answer-list-dialog';
import { BookmarkQuestionButton } from '@/components/bookmark/bookmark-question-button';
import { RetryButton } from '@/components/common/retry-button';
import { DeleteQuestionButton } from '@/components/question/delete-question-button';
import { QuestionDetailSection } from '@/components/question/question-detail-section';
import { serverFetch } from '@/lib/fetch/server';
import type { QuestionDetailResponse } from '@/types/question';
import { notFound } from 'next/navigation';

export default async function QuestionLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ questionId?: string }>;
}>) {
  const { questionId } = await params;

  if (!questionId) notFound();

  const result = await serverFetch<QuestionDetailResponse>(
    `/api/questions/${questionId}`,
  );

  if (!result.ok) {
    if (result.status === 404) notFound();

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
        <RetryButton
          title="해당 질문을 가져오는 데 실패했습니다."
          description="잠시 후 다시 시도해주세요."
        />
      </div>
    );
  }

  const { tags, content: question, isBookmarked, idealAnswer } = result.data;

  // 북마크, 질문 삭제 컴포넌트 추가 예정
  // children에는 사용자 답변 폼이나 피드백 내용이 들어갈 예정

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <AnswerListDialog questionId={questionId} />
          <div className="flex gap-3">
            <BookmarkQuestionButton
              questionId={questionId}
              initialIsBookmarked={isBookmarked}
              size={26}
            />
            <DeleteQuestionButton questionId={questionId} size={26} />
          </div>
        </div>
        <QuestionDetailSection
          question={question}
          tags={tags}
          idealAnswer={idealAnswer}
        />
      </div>
      {children}
    </div>
  );
}
