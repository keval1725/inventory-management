/**
 * The complete state of a list screen. One shape, shared by every domain, so
 * the table toolbar, the pagination footer, the URL query string and the
 * backend query parameters all agree without per-domain translation.
 */
export type SortDirection = 'asc' | 'desc';

export type StatusFilter = 'all' | 'active' | 'inactive';

export interface ListQuery {
  page: number;
  pageSize: number;
  /** Free-text search. Empty string means "no search", never null. */
  search: string;
  sortBy: string;
  sortDirection: SortDirection;
  status: StatusFilter;
}

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
