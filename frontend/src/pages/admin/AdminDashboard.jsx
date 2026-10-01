import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../services/adminApi';
import { getErrorPayload } from '../../utils/format';
import Alert from '../../components/Alert';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDashboard()
      .then(({ data }) => active && setStats(data.data))
      .catch((err) => active && setError(getErrorPayload(err).message));
    return () => {
      active = false;
    };
  }, []);

  const tiles = stats
    ? [
        { label: 'Total users', value: stats.totalUsers, to: '/admin/users' },
        { label: 'Total stores', value: stats.totalStores, to: '/admin/stores' },
        { label: 'Total ratings', value: stats.totalRatings },
      ]
    : [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="page-actions">
          <Link to="/admin/stores/new" className="btn btn-primary">
            Add store
          </Link>
          <Link to="/admin/users/new" className="btn btn-secondary">
            Add user
          </Link>
        </div>
      </div>
      <Alert>{error}</Alert>
      {!stats && !error && <p className="muted">Loading...</p>}
      <div className="stat-grid">
        {tiles.map((tile) => (
          <div className="stat-tile" key={tile.label}>
            <span className="stat-value">{tile.value}</span>
            <span className="stat-label">{tile.label}</span>
            {tile.to && (
              <Link to={tile.to} className="stat-link">
                View all
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
