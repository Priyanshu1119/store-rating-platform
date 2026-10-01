import Pagination from './Pagination';

// columns: [{ key, label, sortKey?, render?(row) }]. A column with `sortKey` gets a clickable header.
export default function DataTable({
  columns,
  rows,
  loading,
  error,
  sort,
  onSort,
  pagination,
  onPageChange,
  emptyTitle = 'Nothing to show',
  emptyText = 'No records match your search.',
}) {
  const colSpan = columns.length;

  const ariaSort = (column) => {
    if (!column.sortKey || !sort || sort.sortBy !== column.sortKey) return undefined;
    return sort.order === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className="table-card" aria-busy={loading}>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" aria-sort={ariaSort(column)}>
                  {column.sortKey ? (
                    <button type="button" className="sort-btn" onClick={() => onSort(column.sortKey)}>
                      {column.label}
                      <span className="sort-icon" aria-hidden="true">
                        {sort && sort.sortBy === column.sortKey ? (sort.order === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={loading && rows.length ? 'is-loading' : undefined}>
            {error && (
              <tr>
                <td colSpan={colSpan} className="table-message table-error">
                  {error}
                </td>
              </tr>
            )}
            {!error && loading && rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="table-message">
                  Loading...
                </td>
              </tr>
            )}
            {!error && !loading && rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="table-message">
                  <strong>{emptyTitle}</strong>
                  <span>{emptyText}</span>
                </td>
              </tr>
            )}
            {!error &&
              rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {pagination && !error && <Pagination pagination={pagination} onChange={onPageChange} />}
    </div>
  );
}
