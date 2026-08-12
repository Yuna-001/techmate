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
import { useEffect, useRef, useState } from 'react';

const DEFAULT_ANSWERS_PAGE_SIZE = 2;

const getAnswerPageSize = (height: number): number => {
  if (height >= 900) return 4;
  if (height >= 740) return 3;
  return DEFAULT_ANSWERS_PAGE_SIZE;
};

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'loaded';
      isRefetching: boolean;
      items: AnswerListItem[];
      totalPages: number;
      totalCount: number;
    };

interface AnswerListDialogProps {
  questionId: string;
}

export function AnswerListDialog({ questionId }: AnswerListDialogProps) {
  const pathname = usePathname();

  return <AnswerListDialogContent key={pathname} questionId={questionId} />;
}

interface AnswerListDialogContentProps {
  questionId: string;
}

function AnswerListDialogContent({ questionId }: AnswerListDialogContentProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_ANSWERS_PAGE_SIZE);
  const [retryKey, setRetryKey] = useState(0);
  const [fetchState, setFetchState] = useState<FetchState>({
    status: 'loading',
  });

  const requestIdRef = useRef<number>(0);

  useEffect(() => {
    if (!open) return;

    const requestId = ++requestIdRef.current;

    const fetchAnswers = async () => {
      try {
        const qs = new URLSearchParams({
          limit: String(pageSize),
          page: String(page),
        });

        const result = await clientFetch<AnswerListResponse>(
          `/api/questions/${questionId}/answers?${qs}`,
        );

        if (requestId !== requestIdRef.current) return;

        if (!result.ok || !result.data) {
          setFetchState({
            status: 'error',
            message: '답변 목록을 가져오는 데 실패했습니다.',
          });
          return;
        }

        const { items, totalPages, totalCount } = result.data;
        setFetchState({
          status: 'loaded',
          isRefetching: false,
          items,
          totalPages,
          totalCount,
        });
      } catch {
        if (requestId !== requestIdRef.current) return;

        setFetchState({
          status: 'error',
          message: '네트워크 오류가 발생했습니다.',
        });
      }
    };

    void fetchAnswers();

    return () => {
      requestIdRef.current += 1;
    };
  }, [open, page, pageSize, questionId, retryKey]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setPage(1);
      setPageSize(getAnswerPageSize(window.innerHeight));
      setFetchState({ status: 'loading' });
    } else {
      requestIdRef.current += 1;
    }
    setOpen(nextOpen);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;
    setFetchState((prev) =>
      prev.status === 'loaded' ? { ...prev, isRefetching: true } : prev,
    );
    setPage(nextPage);
  };

  const handleRetry = () => {
    setFetchState({ status: 'loading' });
    setRetryKey((prev) => prev + 1);
  };

  const isContentLoading =
    fetchState.status === 'loading' ||
    (fetchState.status === 'loaded' && fetchState.isRefetching);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-normal text-sm">
          답변 목록
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-4/5 overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="font-normal text-base text-left">
            내가 작성한 답변 목록
          </DialogTitle>
          {fetchState.status === 'loading' && <Skeleton className="h-4 w-20" />}
          {fetchState.status === 'loaded' && (
            <DialogDescription className="text-left">
              총 {fetchState.totalCount}개
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {isContentLoading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: pageSize }).map((_, idx) => (
                <Skeleton key={idx} className="h-32 w-full" />
              ))}
            </div>
          )}
          {fetchState.status === 'error' && (
            <div className="flex flex-col gap-4 text-sm text-center">
              <p className="py-10 text-slate-700">{fetchState.message}</p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                다시 시도
              </Button>
            </div>
          )}
          {fetchState.status === 'loaded' && !fetchState.isRefetching && (
            <AnswerList questionId={questionId} items={fetchState.items} />
          )}

          {fetchState.status === 'loading' && (
            <div className="flex justify-center">
              <Skeleton className="h-8 w-2/3" />
            </div>
          )}
          {fetchState.status === 'loaded' && (
            <DialogPagination
              page={page}
              totalPages={fetchState.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
