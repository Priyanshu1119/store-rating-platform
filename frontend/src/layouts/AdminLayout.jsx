import BaseLayout from './BaseLayout';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/stores', label: 'Stores', end: true },
  { to: '/admin/stores/new', label: 'Add store' },
  { to: '/admin/users', label: 'Users', end: true },
  { to: '/admin/users/new', label: 'Add user' },
  { to: '/admin/change-password', label: 'Change password' },
];

export default function AdminLayout() {
  return <BaseLayout links={links} />;
}
