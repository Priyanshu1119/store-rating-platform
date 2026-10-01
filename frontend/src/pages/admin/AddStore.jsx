import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createStore, getAvailableOwners } from '../../services/adminApi';
import { addressError, compact, emailError, nameError } from '../../utils/validators';
import { getErrorPayload } from '../../utils/format';
import FormField from '../../components/FormField';
import Alert from '../../components/Alert';

const EMPTY = { name: '', email: '', address: '', ownerId: '' };

export default function AddStore() {
  const [form, setForm] = useState(EMPTY);
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOwners = () =>
    getAvailableOwners()
      .then(({ data }) => setOwners(data.data))
      .catch((err) => setFormError(getErrorPayload(err).message));

  useEffect(() => {
    loadOwners();
  }, []);

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
      address: addressError(form.address),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const { data } = await createStore({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        ownerId: form.ownerId ? Number(form.ownerId) : null,
      });
      setSuccess(`${data.data.name} was added.`);
      setForm(EMPTY);
      loadOwners();
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
        <h1>Add store</h1>
      </div>
      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <Alert type="success">{success}</Alert>
        <Alert>{formError}</Alert>
        <FormField label="Store name" name="name" value={form.name} onChange={handleChange} error={errors.name} hint="20 to 60 characters" />
        <FormField label="Store email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
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
        <FormField
          label="Store owner"
          name="ownerId"
          as="select"
          value={form.ownerId}
          onChange={handleChange}
          error={errors.ownerId}
          hint={owners.length === 0 ? 'No store owners without a store. Add a user with the Store owner role first.' : 'Optional. Each owner can have one store.'}
        >
          <option value="">No owner yet</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name} ({owner.email})
            </option>
          ))}
        </FormField>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add store'}
          </button>
          <Link to="/admin/stores" className="btn btn-secondary">
            View stores
          </Link>
        </div>
      </form>
    </div>
  );
}
