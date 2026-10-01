import { useState } from 'react';
import { changePasswordRequest } from '../services/authApi';
import { compact, passwordError } from '../utils/validators';
import { getErrorPayload } from '../utils/format';
import FormField from '../components/FormField';
import Alert from '../components/Alert';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

// Used by all three roles.
export default function ChangePassword() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');

    const found = compact({
      currentPassword: form.currentPassword ? '' : 'Current password is required',
      newPassword:
        passwordError(form.newPassword) ||
        (form.newPassword === form.currentPassword ? 'New password must be different from the current one' : ''),
      confirmPassword: form.confirmPassword === form.newPassword ? '' : 'Passwords do not match',
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await changePasswordRequest({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess('Your password has been updated.');
      setForm(EMPTY);
    } catch (err) {
      const payload = getErrorPayload(err);
      if (Object.keys(payload.errors).length > 0) setErrors(payload.errors);
      else setFormError(payload.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Change password</h1>
      </div>
      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <Alert type="success">{success}</Alert>
        <Alert>{formError}</Alert>
        <FormField
          label="Current password"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          autoComplete="current-password"
        />
        <FormField
          label="New password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          hint="8 to 16 characters, with one uppercase letter and one special character"
          autoComplete="new-password"
        />
        <FormField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
