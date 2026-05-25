import Link from 'next/link';

import { Button } from '@/components/ui/button';

type RetryAnswerButtonProps = {
  questionId: string;
};

export function RetryAnswerButton({ questionId }: RetryAnswerButtonProps) {
  return (
    <Button variant="outline" asChild>
      <Link href={`/questions/${questionId}`}>다시 답변하기</Link>
    </Button>
  );
}
