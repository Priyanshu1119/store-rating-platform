import { useMemo, useState } from 'react';
import useDebounce from './useDebounce';

// Holds search filters, sorting and the page number for a listing, and builds the API query params.
// Text filters are debounced; sorting and paging apply immediately. Any filter or sort change goes back to page 1.
export default function useTableQuery(initialFilters = {}, defaultSort = { sortBy: 'name', order: 'asc' }, limit = 10) {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const debouncedFilters = useDebounce(filters, 400);

  const setFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const onSort = (key) => {
    setSort((prev) =>
      prev.sortBy === key ? { sortBy: key, order: prev.order === 'asc' ? 'desc' : 'asc' } : { sortBy: key, order: 'asc' }
    );
    setPage(1);
  };

  const params = useMemo(
    () => ({ ...debouncedFilters, sortBy: sort.sortBy, order: sort.order, page, limit }),
    [debouncedFilters, sort, page, limit]
  );

  return { filters, setFilter, sort, onSort, page, setPage, params };
}
