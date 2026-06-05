'use client';

import { LoadingButton } from '@/components/common/loading-button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { MAX_ANSWER_LENGTH } from '@/lib/constants/answer';
import { clientFetch } from '@/lib/fetch/client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const CREATING_STATUS_MESSAGES = [
  '답변의 핵심 키워드를 찾는 중...',
  '논리 흐름을 살펴보는 중...',
  '보완 포인트를 정리하는 중...',
] as const;

export function AnswerForm({ questionId }: { questionId: string }) {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [statusIndex, setStatusIndex] = useState<number>(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const router = useRouter();

  const isOverLimit = userAnswer.length > MAX_ANSWER_LENGTH;
  const isDisabled = userAnswer.length === 0 || isOverLimit;

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    const trimmedUserAnswer = userAnswer.trim();

    if (trimmedUserAnswer.length === 0) {
      toast.error('답변 작성 후 피드백을 요청해주세요.');
      return;
    }

    if (trimmedUserAnswer.length > MAX_ANSWER_LENGTH) {
      toast.error(`답변은 ${MAX_ANSWER_LENGTH}자 이내로 작성해주세요.`);
      return;
    }

    setStatusIndex(0);
    setIsCreating(true);
    let navigated = false;

    try {
      const result = await clientFetch<{ answerId: string }>(
        `/api/questions/${questionId}/answers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: userAnswer }),
        },
      );

      if (result.ok && result.data) {
        navigated = true;

        const { answerId } = result.data;
        const href = `/questions/${questionId}/answers/${answerId}`;
        router.prefetch(href);
        router.push(href, {
          scroll: false,
        });

        return;
      }

      toast.error('피드백 생성에 실패했습니다.', {
        description: '잠시 후 다시 시도해주세요.',
      });
    } catch {
      toast.error('네트워크 오류가 발생했습니다.', {
        description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
      });
    } finally {
      if (!navigated) setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!textareaRef.current) return;

    const domValue = textareaRef.current.value;
    if (domValue) setUserAnswer(domValue);
  }, []);

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

  return (
    <form noValidate className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <Field>
        <div className="flex justify-between px-1 items-center">
          <FieldLabel htmlFor="user-answer">사용자 답변</FieldLabel>
          <FieldDescription
            className="text-xs text-slate-600"
            aria-live="polite"
          >
            <span className={isOverLimit ? 'text-red-600' : ''}>
              {userAnswer.length}
            </span>{' '}
            / {MAX_ANSWER_LENGTH}
          </FieldDescription>
        </div>
        <Textarea
          id="user-answer"
          name="user-answer"
          dir="ltr"
          placeholder={`${MAX_ANSWER_LENGTH}자 이내로 답변을 작성해주세요.`}
          className="resize-none min-h-36"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          aria-invalid={isOverLimit}
          ref={textareaRef}
        />
      </Field>
      <div className="flex flex-col gap-2">
        <LoadingButton
          isLoading={isCreating}
          disabled={isDisabled}
          loadingText="피드백 생성 중..."
          className="py-5 w-full"
        >
          AI 피드백 받기
        </LoadingButton>
        {isCreating && (
          <p aria-live="polite" className="text-muted-foreground text-xs">
            {CREATING_STATUS_MESSAGES[statusIndex]}
          </p>
        )}
      </div>
    </form>
  );
}
