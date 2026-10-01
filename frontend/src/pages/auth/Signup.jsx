import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, signup } from '../../redux/slices/authSlice';
import { homePathFor } from '../../utils/roles';
import { addressError, compact, emailError, nameError, passwordError } from '../../utils/validators';
import FormField from '../../components/FormField';
import Alert from '../../components/Alert';

export default function Signup() {
  const dispatch = useDispatch();
  const { token, user, loading, error, fieldErrors } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  if (token && user) return <Navigate to={homePathFor(user.role)} replace />;

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = compact({
      name: nameError(form.name),
      email: emailError(form.email),
      address: addressError(form.address),
      password: passwordError(form.password),
      confirmPassword: form.confirmPassword === form.password ? '' : 'Passwords do not match',
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    dispatch(
      signup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        password: form.password,
      })
    );
  };

  const shown = { ...fieldErrors, ...errors };

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <h1>Create your account</h1>
        <p>Sign up to browse stores and share your ratings. Store owner accounts are created by an admin.</p>
      </section>

      <section className="auth-card">
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit} noValidate>
          <Alert>{error && !Object.keys(fieldErrors).length ? error : ''}</Alert>
          <FormField
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={shown.name}
            hint="20 to 60 characters"
            autoComplete="name"
          />
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
            label="Address"
            name="address"
            as="textarea"
            rows={3}
            value={form.address}
            onChange={handleChange}
            error={shown.address}
            hint="Up to 400 characters"
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={shown.password}
            hint="8 to 16 characters, with one uppercase letter and one special character"
            autoComplete="new-password"
          />
          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={shown.confirmPassword}
            autoComplete="new-password"
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </div>
  );
}
