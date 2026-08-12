export type PaginatedResponse<TItem> = {
  items: TItem[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
};

type BasePaginationProps = {
  page: number;
  totalPages: number;
};

export type LinkPaginationProps = BasePaginationProps & {
  makeHref: (p: number) => string;
};

export type ActionPaginationProps = BasePaginationProps & {
  onPageChange: (p: number) => void;
};
