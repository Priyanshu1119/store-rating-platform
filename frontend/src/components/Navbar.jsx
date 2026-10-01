import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../redux/slices/authSlice';
import { roleLabel } from '../utils/roles';

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <button type="button" className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
      <div className="brand">Store Rating</div>
      <div className="navbar-right">
        {user && (
          <div className="navbar-user">
            <span className="navbar-name">{user.name}</span>
            <span className="navbar-role">{roleLabel(user.role)}</span>
          </div>
        )}
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
