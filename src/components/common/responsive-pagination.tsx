import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getPaginationItems } from '@/lib/pagination/getPaginationItems';
import type { LinkPaginationProps } from '@/types/pagination';

export function ResponsivePagination(props: LinkPaginationProps) {
  if (props.totalPages <= 1) return null;

  return (
    <>
      <div className="sm:hidden" data-testid="pagination-compact">
        <CompactPagination {...props} />
      </div>
      <div className="hidden sm:block" data-testid="pagination-full">
        <FullPagination {...props} />
      </div>
    </>
  );
}

export function CompactPagination({
  page,
  totalPages,
  makeHref,
}: LinkPaginationProps) {
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <Pagination>
      <PaginationContent className="justify-center">
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={makeHref(prevPage)} text="이전" />
          ) : (
            <span
              aria-disabled="true"
              className="pointer-events-none opacity-50"
            >
              <PaginationPrevious href={makeHref(1)} text="이전" />
            </span>
          )}
        </PaginationItem>

        <PaginationItem>
          <span className="px-2 text-sm">
            {page} / {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          {page < totalPages ? (
            <PaginationNext href={makeHref(nextPage)} text="다음" />
          ) : (
            <span
              aria-disabled="true"
              className="pointer-events-none opacity-50"
            >
              <PaginationNext href={makeHref(totalPages)} text="다음" />
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function FullPagination({
  page,
  totalPages,
  makeHref,
}: LinkPaginationProps) {
  const items = getPaginationItems(page, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={makeHref(page - 1)} text="이전" />
          ) : (
            <span
              aria-disabled="true"
              className="pointer-events-none opacity-50"
            >
              <PaginationPrevious href={makeHref(1)} text="이전" />
            </span>
          )}
        </PaginationItem>

        {items.map((item, idx) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`e-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href={makeHref(item)} isActive={item === page}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          {page < totalPages ? (
            <PaginationNext href={makeHref(page + 1)} text="다음" />
          ) : (
            <span
              aria-disabled="true"
              className="pointer-events-none opacity-50"
            >
              <PaginationNext href={makeHref(totalPages)} text="다음" />
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
