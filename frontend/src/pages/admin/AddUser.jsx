import { useState } from 'react';
import { createUser } from '../../services/adminApi';
import { addressError, compact, emailError, nameError, passwordError } from '../../utils/validators';
import { getErrorPayload } from '../../utils/format';
import FormField from '../../components/FormField';
import Alert from '../../components/Alert';

const EMPTY = { name: '', email: '', password: '', address: '', role: 'USER' };

export default function AddUser() {
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
      name: nameError(form.name),
      email: emailError(form.email),
      password: passwordError(form.password),
      address: addressError(form.address),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const { data } = await createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        address: form.address.trim(),
        role: form.role,
      });
      setSuccess(`${data.data.name} was added.`);
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
        <h1>Add user</h1>
      </div>
      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <Alert type="success">{success}</Alert>
        <Alert>{formError}</Alert>
        <FormField label="Full name" name="name" value={form.name} onChange={handleChange} error={errors.name} hint="20 to 60 characters" />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          hint="8 to 16 characters, with one uppercase letter and one special character"
          autoComplete="new-password"
        />
        <FormField
          label="Address"
          name="address"
          as="textarea"
          rows={3}
          value={form.address}
          onChange={handleChange}
          error={errors.address}
          hint="Up to 400 characters"
        />
        <FormField label="Role" name="role" as="select" value={form.role} onChange={handleChange} error={errors.role}>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="OWNER">Store owner</option>
        </FormField>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Add user'}
        </button>
      </form>
    </div>
  );
}
