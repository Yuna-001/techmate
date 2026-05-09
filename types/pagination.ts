export interface PaginatedResponse<TItem> {
  items: TItem[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}
