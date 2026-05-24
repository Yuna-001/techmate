export interface PaginatedResponse<TItem> {
  items: TItem[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}

interface BasePaginationProps {
  page: number;
  totalPages: number;
}

export interface LinkPaginationProps extends BasePaginationProps {
  makeHref: (p: number) => string;
}

export interface ActionPaginationProps extends BasePaginationProps {
  onPageChange: (p: number) => void;
}
