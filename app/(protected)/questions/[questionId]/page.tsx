import { AnswerForm } from '@/components/answer/answer-form';

export default async function AnswerWritePage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;

  return <AnswerForm questionId={questionId} />;
}
