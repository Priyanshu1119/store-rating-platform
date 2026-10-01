import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUser } from '../../services/adminApi';
import { formatDate, getErrorPayload } from '../../utils/format';
import { roleLabel } from '../../utils/roles';
import Alert from '../../components/Alert';
import RatingStars from '../../components/RatingStars';

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setUser(null);
    setError('');
    getUser(id)
      .then(({ data }) => active && setUser(data.data))
      .catch((err) => active && setError(getErrorPayload(err).message));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>User details</h1>
        <div className="page-actions">
          <Link to="/admin/users" className="btn btn-secondary">
            Back to users
          </Link>
        </div>
      </div>

      <Alert>{error}</Alert>
      {!user && !error && <p className="muted">Loading...</p>}

      {user && (
        <div className="card">
          <dl className="details">
            <div>
              <dt>Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{user.address}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>
                <span className={`badge badge-${user.role}`}>{roleLabel(user.role)}</span>
              </dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
            {user.role === 'OWNER' && (
              <div>
                <dt>Store</dt>
                <dd>
                  {user.store ? (
                    <>
                      {user.store.name}
                      <div className="details-rating">
                        {user.store.rating === null ? (
                          <span className="muted">No ratings yet</span>
                        ) : (
                          <>
                            <RatingStars value={user.store.rating} showValue />
                            <span className="muted">
                              {user.store.ratingCount} {user.store.ratingCount === 1 ? 'rating' : 'ratings'}
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="muted">No store assigned</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
