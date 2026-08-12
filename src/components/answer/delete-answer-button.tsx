'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { clientFetch } from '@/lib/fetch/client';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type DeleteAnswerButtonProps = {
  questionId: string;
  answerId: string;
  className?: string;
};

export function DeleteAnswerButton({
  questionId,
  answerId,
  className,
}: DeleteAnswerButtonProps) {
  const router = useRouter();

  const handleDeleteAnswer = async () => {
    try {
      const result = await clientFetch(
        `/api/questions/${questionId}/answers/${answerId}`,
        {
          method: 'DELETE',
          expectNoContent: true,
        },
      );

      if (!result.ok) {
        toast.error('답변 삭제에 실패했습니다.', {
          description: '잠시 후 다시 시도해주세요.',
        });
        return;
      }

      router.push(`/questions/${questionId}`);
    } catch {
      toast.error('네트워크 오류가 발생했습니다.', {
        description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'text-muted-foreground hover:text-destructive',
            className,
          )}
        >
          답변 삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>답변을 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription className="break-keep">
            답변을 삭제하면 관련 피드백이 함께 삭제되며 복구할 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAnswer} variant="destructive">
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
