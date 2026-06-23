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
import { clientFetch } from '@/lib/fetch/client';
import { cn } from '@/lib/utils';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type DeleteQuestionButtonProps = {
  questionId: string;
  className?: string;
  size?: number;
  afterDelete?: 'home' | 'refresh';
};

export function DeleteQuestionButton({
  questionId,
  className,
  size = 32,
  afterDelete = 'home',
}: DeleteQuestionButtonProps) {
  const router = useRouter();

  const handleDeleteQuestion = async () => {
    try {
      const result = await clientFetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
        expectNoContent: true,
      });

      if (!result.ok) {
        toast.error('질문 삭제에 실패했습니다.', {
          description: '잠시 후 다시 시도해주세요.',
        });
        return;
      }

      if (afterDelete === 'refresh') {
        router.refresh();
        return;
      }

      router.push(`/`);
    } catch {
      toast.error('네트워크 오류가 발생했습니다.', {
        description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label="질문 삭제"
          className={cn(
            'cursor-pointer flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
        >
          <Trash className="stroke-2" size={size} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>질문을 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription className="break-keep">
            질문을 삭제하면 관련 답변과 피드백이 함께 삭제되며 복구할 수
            없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteQuestion}
            variant="destructive"
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
