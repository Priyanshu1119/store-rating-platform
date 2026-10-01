import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile } from '../../services/authApi';
import { formatDate, getErrorPayload } from '../../utils/format';
import { roleLabel } from '../../utils/roles';
import Alert from '../../components/Alert';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getProfile()
      .then(({ data }) => active && setUser(data.data))
      .catch((err) => active && setError(getErrorPayload(err).message));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My profile</h1>
        <div className="page-actions">
          <Link to="/user/change-password" className="btn btn-secondary">
            Change password
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
              <dt>Account type</dt>
              <dd>{roleLabel(user.role)}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
