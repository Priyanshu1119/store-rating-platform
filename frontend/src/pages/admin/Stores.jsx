import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStores } from '../../redux/slices/storeSlice';
import useTableQuery from '../../hooks/useTableQuery';
import DataTable from '../../components/DataTable';
import SearchBar from '../../components/SearchBar';
import RatingStars from '../../components/RatingStars';

const COLUMNS = [
  { key: 'name', label: 'Name', sortKey: 'name' },
  { key: 'email', label: 'Email', sortKey: 'email' },
  { key: 'address', label: 'Address', sortKey: 'address' },
  {
    key: 'rating',
    label: 'Overall rating',
    sortKey: 'rating',
    render: (row) =>
      row.overallRating === null ? (
        <span className="muted">No ratings yet</span>
      ) : (
        <RatingStars value={row.overallRating} showValue />
      ),
  },
];

export default function Stores() {
  const dispatch = useDispatch();
  const { items, pagination, loading, error } = useSelector((state) => state.stores.adminList);
  const { filters, setFilter, sort, onSort, setPage, params } = useTableQuery({ name: '', email: '', address: '' });

  useEffect(() => {
    dispatch(fetchAdminStores(params));
  }, [dispatch, params]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stores</h1>
        <div className="page-actions">
          <Link to="/admin/stores/new" className="btn btn-primary">
            Add store
          </Link>
        </div>
      </div>

      <div className="filters">
        <SearchBar label="Name" name="filter-name" value={filters.name} onChange={(v) => setFilter('name', v)} placeholder="Search name" />
        <SearchBar label="Email" name="filter-email" value={filters.email} onChange={(v) => setFilter('email', v)} placeholder="Search email" />
        <SearchBar label="Address" name="filter-address" value={filters.address} onChange={(v) => setFilter('address', v)} placeholder="Search address" />
      </div>

      <DataTable
        columns={COLUMNS}
        rows={items}
        loading={loading}
        error={error}
        sort={sort}
        onSort={onSort}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No stores found"
        emptyText="Try a different search, or add a store."
      />
    </div>
  );
}
