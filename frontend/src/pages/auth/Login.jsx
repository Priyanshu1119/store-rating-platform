import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, login } from '../../redux/slices/authSlice';
import { homePathFor } from '../../utils/roles';
import { compact, emailError } from '../../utils/validators';
import FormField from '../../components/FormField';
import Alert from '../../components/Alert';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@storerating.com', password: 'Admin@123' },
  { label: 'Store owner', email: 'owner1@storerating.com', password: 'Owner@123' },
  { label: 'User', email: 'amit@example.com', password: 'User@123' },
];

export default function Login() {
  const dispatch = useDispatch();
  const { token, user, loading, error, fieldErrors } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Once logged in, go to the dashboard for the user's role.
  if (token && user) return <Navigate to={homePathFor(user.role)} replace />;

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = compact({
      email: emailError(form.email),
      password: form.password ? '' : 'Password is required',
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    dispatch(login({ email: form.email.trim().toLowerCase(), password: form.password }));
  };

  const shown = { ...fieldErrors, ...errors };

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <h1>Store Rating Platform</h1>
        <p>Find stores, rate them from 1 to 5, and see how customers rate yours.</p>
        <div className="demo-box">
          <h2>Demo accounts</h2>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.label}
              type="button"
              className="demo-btn"
              onClick={() => setForm({ email: account.email, password: account.password })}
            >
              <span>{account.label}</span>
              <span>{account.email}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="auth-card">
        <h2>Log in</h2>
        <form onSubmit={handleSubmit} noValidate>
          <Alert>{error && !Object.keys(fieldErrors).length ? error : ''}</Alert>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={shown.email}
            autoComplete="email"
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={shown.password}
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </div>
  );
}
