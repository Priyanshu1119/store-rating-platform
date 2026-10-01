export const ROLES = { ADMIN: 'ADMIN', USER: 'USER', OWNER: 'OWNER' };

// Where each role lands after login.
export const homePathFor = (role) => {
  if (role === ROLES.ADMIN) return '/admin';
  if (role === ROLES.OWNER) return '/owner';
  return '/user/stores';
};

export const roleLabel = (role) => ({ ADMIN: 'Admin', USER: 'User', OWNER: 'Store owner' })[role] || role;
