'use client';

import { LoadingButton } from '@/components/common/loading-button';
import { clientFetch } from '@/lib/fetch/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const CREATING_STATUS_MESSAGES = [
  '기술 스택을 훑어보는 중...',
  '질문 초안을 구상하는 중...',
  '질문을 다듬는 중...',
] as const;

type CreateQuestionButtonProps = {
  hasProfile?: boolean;
};

export function CreateQuestionButton({
  hasProfile = true,
}: CreateQuestionButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [statusIndex, setStatusIndex] = useState<number>(0);

  useEffect(() => {
    if (!isCreating) {
      setStatusIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setStatusIndex((currentIndex) =>
        Math.min(currentIndex + 1, CREATING_STATUS_MESSAGES.length - 1),
      );
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [isCreating]);

  const handleCreateQuestion = async () => {
    if (!hasProfile) return;
    if (isCreating) return;

    let navigated = false;
    setStatusIndex(0);
    setIsCreating(true);

    try {
      const result = await clientFetch<{ questionId: string }>(
        '/api/questions',
        {
          method: 'POST',
        },
      );

      if (!result.ok) {
        toast.error('기술 질문 생성에 실패했습니다.', {
          description: '잠시 후 다시 시도해주세요.',
        });
        return;
      }

      const { questionId } = result.data;

      navigated = true;
      router.push(`/questions/${questionId}`);
    } catch {
      toast.error('네트워크 오류가 발생했습니다.', {
        description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
      });
    } finally {
      if (!navigated) setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {!hasProfile && (
        <p className="text-muted-foreground text-sm">
          기술 질문 생성을 위해{' '}
          <Link
            href="/setting/profile/edit"
            className="text-primary rounded-sm px-0.5 font-medium"
          >
            프로필 설정
          </Link>
          이 필요합니다.
        </p>
      )}
      <div className="relative inline-flex">
        <LoadingButton
          onClick={handleCreateQuestion}
          isLoading={isCreating}
          loadingText="기술 질문 생성 중..."
          disabled={!hasProfile}
        >
          기술 질문 생성하기
        </LoadingButton>
        {isCreating && (
          <p
            aria-live="polite"
            className="text-muted-foreground absolute top-full left-1/2 mt-2 w-max -translate-x-1/2 text-xs"
          >
            {CREATING_STATUS_MESSAGES[statusIndex]}
          </p>
        )}
      </div>
    </div>
  );
}
