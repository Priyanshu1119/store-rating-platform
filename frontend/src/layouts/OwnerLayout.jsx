import BaseLayout from './BaseLayout';

const links = [
  { to: '/owner', label: 'Dashboard', end: true },
  { to: '/owner/change-password', label: 'Change password' },
];

export default function OwnerLayout() {
  return <BaseLayout links={links} />;
}
