import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores, saveRating } from '../../redux/slices/storeSlice';
import useTableQuery from '../../hooks/useTableQuery';
import DataTable from '../../components/DataTable';
import SearchBar from '../../components/SearchBar';
import RatingStars from '../../components/RatingStars';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { ratingError } from '../../utils/validators';

export default function StoreList() {
  const dispatch = useDispatch();
  const { items, pagination, loading, error } = useSelector((state) => state.stores.userList);
  const saving = useSelector((state) => state.stores.saving);
  const { filters, setFilter, sort, onSort, setPage, params } = useTableQuery({ name: '', address: '' });

  const [target, setTarget] = useState(null);
  const [rating, setRating] = useState(0);
  const [modalError, setModalError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    dispatch(fetchStores(params));
  }, [dispatch, params]);

  const openModal = (store) => {
    setTarget(store);
    setRating(store.userRating || 0);
    setModalError('');
    setNotice('');
  };

  const closeModal = () => setTarget(null);

  const handleSave = async () => {
    const problem = ratingError(rating);
    if (problem) {
      setModalError(problem);
      return;
    }
    const isEdit = target.userRating !== null && target.userRating !== undefined;
    const result = await dispatch(saveRating({ storeId: target.id, rating, isEdit }));
    if (saveRating.fulfilled.match(result)) {
      setNotice(`${isEdit ? 'Updated' : 'Saved'} your rating for ${target.name}.`);
      closeModal();
    } else {
      setModalError(result.payload ? result.payload.message : 'Could not save your rating');
    }
  };

  const columns = [
    { key: 'name', label: 'Store', sortKey: 'name' },
    { key: 'address', label: 'Address', sortKey: 'address' },
    {
      key: 'overall',
      label: 'Overall rating',
      sortKey: 'rating',
      render: (row) =>
        row.overallRating === null ? (
          <span className="muted">No ratings yet</span>
        ) : (
          <span className="rating-cell">
            <RatingStars value={row.overallRating} showValue />
            <span className="muted">({row.ratingCount})</span>
          </span>
        ),
    },
    {
      key: 'mine',
      label: 'Your rating',
      render: (row) =>
        row.userRating === null || row.userRating === undefined ? (
          <span className="muted">Not rated</span>
        ) : (
          <RatingStars value={row.userRating} showValue />
        ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => {
        const rated = row.userRating !== null && row.userRating !== undefined;
        return (
          <button type="button" className={rated ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'} onClick={() => openModal(row)}>
            {rated ? 'Edit rating' : 'Rate'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stores</h1>
      </div>

      <Alert type="success">{notice}</Alert>

      <div className="filters">
        <SearchBar label="Store name" name="filter-name" value={filters.name} onChange={(v) => setFilter('name', v)} placeholder="Search by name" />
        <SearchBar label="Address" name="filter-address" value={filters.address} onChange={(v) => setFilter('address', v)} placeholder="Search by address" />
      </div>

      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        sort={sort}
        onSort={onSort}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No stores found"
        emptyText="Try a different name or address."
      />

      <Modal open={Boolean(target)} title={target ? (target.userRating ? 'Edit your rating' : 'Rate this store') : ''} onClose={closeModal}>
        {target && (
          <div className="modal-body">
            <p className="modal-store">{target.name}</p>
            <Alert>{modalError}</Alert>
            <RatingStars
              value={rating}
              size="lg"
              onChange={(value) => {
                setRating(value);
                setModalError('');
              }}
            />
            <p className="muted">{rating ? `${rating} out of 5` : 'Select 1 to 5 stars'}</p>
            <div className="form-actions">
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save rating'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
