import Link from 'next/link';

import { Button } from '@/components/ui/button';

type RetryAnswerButtonProps = {
  questionId: string;
  className?: string;
};

export function RetryAnswerButton({
  questionId,
  className,
}: RetryAnswerButtonProps) {
  return (
    <Button variant="outline" className={className} asChild>
      <Link href={`/questions/${questionId}`}>다시 답변</Link>
    </Button>
  );
}
