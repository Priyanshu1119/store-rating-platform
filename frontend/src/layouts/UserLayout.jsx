import BaseLayout from './BaseLayout';

const links = [
  { to: '/user/stores', label: 'Stores' },
  { to: '/user/profile', label: 'My profile' },
  { to: '/user/change-password', label: 'Change password' },
];

export default function UserLayout() {
  return <BaseLayout links={links} />;
}
