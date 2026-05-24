'use client';

import { AnswerList } from '@/components/answer/answer-list';
import { DialogPagination } from '@/components/common/dialog-pagination';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { clientFetch } from '@/lib/fetch/client';
import type { AnswerListItem, AnswerListResponse } from '@/types/answer';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const ANSWERS_PAGE_SIZE = 2;

interface AnswerListDialogProps {
  questionId: string;
}

export function AnswerListDialog({ questionId }: AnswerListDialogProps) {
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>();
  const [totalCount, setTotalCount] = useState<number>();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<AnswerListItem[]>([]);

  const requestIdRef = useRef<number>(0);

  const fetchAnswers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const requestId = ++requestIdRef.current;

    const qs = new URLSearchParams({
      limit: String(ANSWERS_PAGE_SIZE),
      page: String(page),
    });

    try {
      const result = await clientFetch<AnswerListResponse>(
        `/api/questions/${questionId}/answers?${qs}`,
      );

      if (requestId !== requestIdRef.current) return;

      if (!result.ok || !result.data) {
        setError('답변 목록을 가져오는 데 실패했습니다.');
        setAnswers([]);
        return;
      }

      const data = result.data;
      setAnswers(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, questionId]);

  useEffect(() => {
    if (!open) return;

    fetchAnswers();
  }, [fetchAnswers, open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setPage(1);
      setIsLoading(true);
    }
    setOpen(nextOpen);
    setError(null);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;

    setIsLoading(true);
    setPage(nextPage);
  };

  const shouldShowTotalCount = totalCount !== undefined;
  const shouldShowPagination = totalPages !== undefined;
  const shouldShowSkeleton = isLoading;

  let description = null;

  if (shouldShowSkeleton) {
    description = <Skeleton className="h-4 w-20" />;
  } else if (shouldShowTotalCount) {
    description = (
      <DialogDescription className="text-left">
        총 {totalCount}개
      </DialogDescription>
    );
  }

  let content;

  if (error) {
    content = (
      <div className="flex flex-col gap-4 text-sm text-center">
        <p className="py-10 text-slate-700">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchAnswers}>
          다시 시도
        </Button>
      </div>
    );
  } else if (shouldShowSkeleton) {
    content = (
      <div className="flex flex-col gap-4">
        {Array.from({ length: ANSWERS_PAGE_SIZE }).map((_, idx) => (
          <Skeleton key={idx} className="h-32 w-full" />
        ))}
      </div>
    );
  } else {
    content = <AnswerList questionId={questionId} items={answers} />;
  }

  let pagination = null;

  if (shouldShowSkeleton) {
    pagination = (
      <div className="flex justify-center">
        <Skeleton className="h-8 w-2/3" />
      </div>
    );
  } else if (shouldShowPagination) {
    pagination = (
      <DialogPagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-normal text-sm">
          답변 목록
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-4/5" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-normal text-base text-left">
            내가 작성한 답변 목록
          </DialogTitle>
          {description}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {content}
          {pagination}
        </div>
      </DialogContent>
    </Dialog>
  );
}
