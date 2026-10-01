import { useEffect, useState } from 'react';
import { getOwnerDashboard } from '../../services/storeApi';
import useTableQuery from '../../hooks/useTableQuery';
import { formatDate, getErrorPayload } from '../../utils/format';
import DataTable from '../../components/DataTable';
import RatingStars from '../../components/RatingStars';
import Alert from '../../components/Alert';

const COLUMNS = [
  { key: 'userName', label: 'User', sortKey: 'name' },
  { key: 'userEmail', label: 'Email', sortKey: 'email' },
  { key: 'rating', label: 'Rating', sortKey: 'rating', render: (row) => <RatingStars value={row.rating} showValue /> },
  { key: 'date', label: 'Date', sortKey: 'date', render: (row) => formatDate(row.date) },
];

const EMPTY_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 0 };

export default function OwnerDashboard() {
  const { sort, onSort, setPage, params } = useTableQuery({}, { sortBy: 'date', order: 'desc' });
  const [data, setData] = useState({ store: null, ratings: [], pagination: EMPTY_PAGINATION });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getOwnerDashboard(params)
      .then(({ data: body }) => active && setData(body.data))
      .catch((err) => active && setError(getErrorPayload(err).message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params]);

  const { store } = data;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{store ? store.name : 'Dashboard'}</h1>
      </div>

      <Alert>{error}</Alert>

      {!loading && !error && !store && (
        <div className="card empty-card">
          <strong>No store is linked to your account yet</strong>
          <span>Ask an admin to assign a store to you. Your ratings will show up here.</span>
        </div>
      )}

      {store && (
        <>
          <div className="owner-summary">
            <div className="owner-score">
              <span className="owner-score-value">{store.averageRating === null ? '-' : store.averageRating.toFixed(1)}</span>
              <span className="stat-label">Average rating</span>
              {store.averageRating !== null && <RatingStars value={store.averageRating} size="lg" />}
            </div>
            <div className="stat-tile">
              <span className="stat-value">{store.totalRatings}</span>
              <span className="stat-label">Total ratings</span>
            </div>
            <div className="stat-tile owner-address">
              <span className="stat-label">Store address</span>
              <span>{store.address}</span>
            </div>
          </div>

          <h2 className="section-title">Users who rated your store</h2>
          <DataTable
            columns={COLUMNS}
            rows={data.ratings}
            loading={loading}
            sort={sort}
            onSort={onSort}
            pagination={data.pagination}
            onPageChange={setPage}
            emptyTitle="No ratings yet"
            emptyText="Ratings from customers will appear here."
          />
        </>
      )}
    </div>
  );
}
