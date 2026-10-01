import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../redux/slices/userSlice';
import useTableQuery from '../../hooks/useTableQuery';
import { roleLabel } from '../../utils/roles';
import DataTable from '../../components/DataTable';
import SearchBar from '../../components/SearchBar';

const COLUMNS = [
  { key: 'name', label: 'Name', sortKey: 'name' },
  { key: 'email', label: 'Email', sortKey: 'email' },
  { key: 'address', label: 'Address', sortKey: 'address' },
  { key: 'role', label: 'Role', sortKey: 'role', render: (row) => <span className={`badge badge-${row.role}`}>{roleLabel(row.role)}</span> },
  {
    key: 'actions',
    label: 'Details',
    render: (row) => (
      <Link to={`/admin/users/${row.id}`} className="link">
        View
      </Link>
    ),
  },
];

export default function Users() {
  const dispatch = useDispatch();
  const { items, pagination, loading, error } = useSelector((state) => state.users);
  const { filters, setFilter, sort, onSort, setPage, params } = useTableQuery({
    name: '',
    email: '',
    address: '',
    role: '',
  });

  useEffect(() => {
    dispatch(fetchUsers(params));
  }, [dispatch, params]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <div className="page-actions">
          <Link to="/admin/users/new" className="btn btn-primary">
            Add user
          </Link>
        </div>
      </div>

      <div className="filters">
        <SearchBar label="Name" name="filter-name" value={filters.name} onChange={(v) => setFilter('name', v)} placeholder="Search name" />
        <SearchBar label="Email" name="filter-email" value={filters.email} onChange={(v) => setFilter('email', v)} placeholder="Search email" />
        <SearchBar label="Address" name="filter-address" value={filters.address} onChange={(v) => setFilter('address', v)} placeholder="Search address" />
        <div className="search-bar">
          <label htmlFor="filter-role">Role</label>
          <select id="filter-role" value={filters.role} onChange={(event) => setFilter('role', event.target.value)}>
            <option value="">All roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Store owner</option>
          </select>
        </div>
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
        emptyTitle="No users found"
        emptyText="Try a different search or clear the filters."
      />
    </div>
  );
}
