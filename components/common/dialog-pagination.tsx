import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
import { getPaginationItems } from '@/lib/pagination/getPaginationItems';
import type { ActionPaginationProps } from '@/types/pagination';

export function DialogPagination(props: ActionPaginationProps) {
  if (props.totalPages <= 1) return null;

  return (
    <>
      <div className="sm:hidden" data-testid="pagination-compact">
        <DialogCompactPagination {...props} />
      </div>
      <div className="hidden sm:block" data-testid="pagination-full">
        <DialogFullPagination {...props} />
      </div>
    </>
  );
}

export function DialogCompactPagination({
  page,
  totalPages,
  onPageChange,
}: ActionPaginationProps) {
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <Pagination>
      <PaginationContent className="justify-center">
        <PaginationItem>
          <DialogArrowButton
            direction="prev"
            disabled={page <= 1}
            onClick={() => onPageChange(prevPage)}
          />
        </PaginationItem>

        <PaginationItem>
          <span className="px-2 text-sm">
            {page} / {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          <DialogArrowButton
            direction="next"
            disabled={page >= totalPages}
            onClick={() => onPageChange(nextPage)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function DialogFullPagination({
  page,
  totalPages,
  onPageChange,
}: ActionPaginationProps) {
  const items = getPaginationItems(page, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <DialogArrowButton
            direction="prev"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          />
        </PaginationItem>

        {items.map((item, idx) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`e-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <DialogPageNumberButton
                pageNumber={item}
                isActive={item === page}
                onClick={() => onPageChange(item)}
              />
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <DialogArrowButton
            direction="next"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function DialogArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  const label = direction === 'prev' ? '이전 페이지' : '다음 페이지';
  const text = direction === 'prev' ? '이전' : '다음';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="h-9 px-3"
    >
      {text}
    </Button>
  );
}

function DialogPageNumberButton({
  pageNumber,
  isActive,
  onClick,
}: {
  pageNumber: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={isActive ? 'outline' : 'ghost'}
      size="icon"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`${pageNumber}페이지`}
      className="h-9 w-9"
    >
      {pageNumber}
    </Button>
  );
}
