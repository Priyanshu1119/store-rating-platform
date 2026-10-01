// End-to-end smoke test. Reload the seed data (npm run db:seed), start the API (npm start), then run: npm run test:smoke
const BASE = process.env.API_URL || 'http://localhost:5000/api';

let passed = 0;
let failed = 0;

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* empty body */
  }
  return { status: res.status, data };
};

const check = (label, condition, extra = '') => {
  if (condition) {
    passed += 1;
    console.log(`  ok    ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label} ${extra}`);
  }
};

const login = async (email, password) => (await call('POST', '/auth/login', { body: { email, password } })).data.token;

const run = async () => {
  const stamp = Date.now();
  const newEmail = `smoke${stamp}@example.com`;
  const newUser = {
    name: 'Smoke Test Customer Account',
    email: newEmail,
    password: 'Smoke@123',
    address: '1 Test Street, Agra',
  };

  console.log('Auth');
  let r = await call('POST', '/auth/signup', { body: newUser });
  check('signup returns 201 and token', r.status === 201 && !!r.data.token, JSON.stringify(r.data));
  check('signup response has no password', r.data.user && r.data.user.password === undefined);
  check('signup creates role USER', r.data.user.role === 'USER');
  r = await call('POST', '/auth/signup', { body: newUser });
  check('duplicate email is 409', r.status === 409);
  r = await call('POST', '/auth/signup', { body: { ...newUser, email: 'x@example.com', name: 'Short' } });
  check('short name is 400 with field error', r.status === 400 && !!r.data.errors.name);
  r = await call('POST', '/auth/signup', { body: { ...newUser, email: 'y@example.com', password: 'weakpass' } });
  check('weak password is 400', r.status === 400 && !!r.data.errors.password);
  r = await call('POST', '/auth/signup', { body: { ...newUser, email: 'z@example.com', address: 'a'.repeat(401) } });
  check('address over 400 chars is 400', r.status === 400 && !!r.data.errors.address);
  r = await call('POST', '/auth/login', { body: { email: newEmail, password: 'Wrong@1234' } });
  check('wrong password is 401', r.status === 401);
  r = await call('POST', '/auth/login', { body: { email: 'not-an-email', password: 'x' } });
  check('invalid email on login is 400', r.status === 400);

  const userToken = await login(newEmail, 'Smoke@123');
  const adminToken = await login('admin@storerating.com', 'Admin@123');
  const ownerToken = await login('owner1@storerating.com', 'Owner@123');
  check('all three roles can log in', !!userToken && !!adminToken && !!ownerToken);

  r = await call('GET', '/stores');
  check('stores without token is 401', r.status === 401);
  r = await call('GET', '/stores', { token: 'garbage' });
  check('stores with bad token is 401', r.status === 401);

  console.log('Stores, search, sort, pagination (USER)');
  r = await call('GET', '/stores?limit=2&page=1', { token: userToken });
  check('list returns 2 of 4 stores', r.status === 200 && r.data.data.length === 2 && r.data.pagination.total === 4 && r.data.pagination.totalPages === 2);
  r = await call('GET', '/stores?limit=2&page=2', { token: userToken });
  check('page 2 returns the other 2 stores', r.data.data.length === 2);
  r = await call('GET', '/stores?name=green', { token: userToken });
  check('search by name', r.data.data.length === 1 && r.data.data[0].name.startsWith('Green Basket'));
  r = await call('GET', '/stores?address=mathura', { token: userToken });
  check('search by address', r.data.data.length === 2);
  r = await call('GET', '/stores?name=%25', { token: userToken });
  check('percent sign is treated literally', r.data.data.length === 0);
  r = await call('GET', '/stores?sortBy=rating&order=desc', { token: userToken });
  const ratings = r.data.data.map((s) => s.overallRating);
  check('sort by rating desc puts unrated store last', ratings[0] === 4.5 && ratings[ratings.length - 1] === null, JSON.stringify(ratings));
  r = await call('GET', '/stores?sortBy=name;DROP TABLE users&order=asc', { token: userToken });
  check('unknown sort column falls back safely', r.status === 200);
  r = await call('GET', '/stores?sortBy=name&order=desc', { token: userToken });
  check('sort by name desc', r.data.data[0].name.startsWith('Urban'));
  const storeId = (await call('GET', '/stores?name=Book Nook', { token: userToken })).data.data[0].id;
  const unratedId = (await call('GET', '/stores?name=Urban', { token: userToken })).data.data[0].id;
  r = await call('GET', `/stores/${unratedId}`, { token: userToken });
  check('store with no ratings has null average and 0 count', r.data.data.overallRating === null && r.data.data.ratingCount === 0);
  r = await call('GET', '/stores/abc', { token: userToken });
  check('invalid store id is 400', r.status === 400);
  r = await call('GET', '/stores/99999', { token: userToken });
  check('missing store is 404', r.status === 404);

  console.log('Ratings');
  r = await call('POST', `/stores/${storeId}/rating`, { token: userToken, body: { rating: 4 } });
  check('submit rating 201', r.status === 201 && r.data.data.userRating === 4);
  check('average updates (5,4 + 4 = 4.3)', r.data.data.overallRating === 4.3 && r.data.data.ratingCount === 3, JSON.stringify(r.data.data));
  r = await call('POST', `/stores/${storeId}/rating`, { token: userToken, body: { rating: 5 } });
  check('second POST for same store is 409', r.status === 409);
  r = await call('PUT', `/stores/${storeId}/rating`, { token: userToken, body: { rating: 2 } });
  check('edit rating 200', r.status === 200 && r.data.data.userRating === 2 && r.data.data.ratingCount === 3);
  for (const bad of [0, 6, 3.5, 'abc', null]) {
    r = await call('PUT', `/stores/${storeId}/rating`, { token: userToken, body: { rating: bad } });
    check(`rating ${JSON.stringify(bad)} is 400`, r.status === 400);
  }
  r = await call('POST', `/stores/${unratedId}/rating`, { token: userToken, body: {} });
  check('empty rating is 400', r.status === 400);
  r = await call('PUT', `/stores/${unratedId}/rating`, { token: userToken, body: { rating: 3 } });
  check('PUT before POST is 404', r.status === 404);
  r = await call('POST', '/stores/99999/rating', { token: userToken, body: { rating: 3 } });
  check('rating unknown store is 404', r.status === 404);
  r = await call('POST', `/stores/${storeId}/rating`, { token: adminToken, body: { rating: 3 } });
  check('admin cannot rate (403)', r.status === 403);
  r = await call('POST', `/stores/${storeId}/rating`, { token: ownerToken, body: { rating: 3 } });
  check('owner cannot rate (403)', r.status === 403);
  r = await call('GET', '/stores?name=Book Nook', { token: userToken });
  check('list shows my rating', r.data.data[0].userRating === 2);

  console.log('Authorization');
  r = await call('GET', '/admin/dashboard', { token: userToken });
  check('USER blocked from admin (403)', r.status === 403);
  r = await call('GET', '/admin/dashboard', { token: ownerToken });
  check('OWNER blocked from admin (403)', r.status === 403);
  r = await call('GET', '/owner/dashboard', { token: userToken });
  check('USER blocked from owner (403)', r.status === 403);
  r = await call('GET', '/owner/dashboard', { token: adminToken });
  check('ADMIN blocked from owner (403)', r.status === 403);

  console.log('Admin');
  r = await call('GET', '/admin/dashboard', { token: adminToken });
  check('dashboard counts', r.status === 200 && r.data.data.totalUsers >= 9 && r.data.data.totalStores === 4 && r.data.data.totalRatings >= 10, JSON.stringify(r.data));
  r = await call('GET', '/admin/users?role=OWNER&sortBy=name&order=asc', { token: adminToken });
  check('filter users by role', r.data.data.length === 2 && r.data.data.every((u) => u.role === 'OWNER'));
  check('user list has no password', r.data.data.every((u) => u.password === undefined));
  r = await call('GET', '/admin/users?email=amit', { token: adminToken });
  check('filter users by email', r.data.data.length === 1);
  r = await call('GET', '/admin/users?address=mathura&role=USER', { token: adminToken });
  check('combined address + role filter', r.data.data.length === 2);
  r = await call('GET', '/admin/users?search=rahul', { token: adminToken });
  check('generic search', r.data.data.length === 1);
  r = await call('GET', '/admin/users?role=BOSS', { token: adminToken });
  check('invalid role filter is 400', r.status === 400);
  r = await call('GET', '/admin/users?limit=3&page=2&sortBy=role&order=desc', { token: adminToken });
  check('users pagination', r.data.data.length === 3 && r.data.pagination.page === 2);
  const ownerRow = (await call('GET', '/admin/users?search=owner1', { token: adminToken })).data.data[0];
  r = await call('GET', `/admin/users/${ownerRow.id}`, { token: adminToken });
  check('owner details include store rating', r.data.data.role === 'OWNER' && r.data.data.store.rating === 4 && r.data.data.store.ratingCount === 4, JSON.stringify(r.data));
  r = await call('GET', '/admin/users/99999', { token: adminToken });
  check('missing user is 404', r.status === 404);

  const adminNew = { name: 'Second Admin Person Account', email: `admin${stamp}@example.com`, password: 'Admin@9999', address: 'HQ', role: 'ADMIN' };
  r = await call('POST', '/admin/users', { token: adminToken, body: adminNew });
  check('admin creates admin user', r.status === 201 && r.data.data.role === 'ADMIN' && r.data.data.password === undefined);
  r = await call('POST', '/admin/users', { token: adminToken, body: adminNew });
  check('admin create duplicate email 409', r.status === 409);
  r = await call('POST', '/admin/users', { token: adminToken, body: { ...adminNew, email: 'q@example.com', role: 'SUPER' } });
  check('invalid role on create is 400', r.status === 400);
  const ownerNew = { name: 'Fresh Owner Without Any Store', email: `owner${stamp}@example.com`, password: 'Owner@9999', address: 'Owner Street', role: 'OWNER' };
  r = await call('POST', '/admin/users', { token: adminToken, body: ownerNew });
  const newOwnerId = r.data.data.id;
  check('admin creates owner', r.status === 201);
  r = await call('GET', '/admin/owners', { token: adminToken });
  check('available owners lists new owner only', r.data.data.some((o) => o.id === newOwnerId) && !r.data.data.some((o) => o.id === ownerRow.id));

  const storeBody = { name: 'Fresh Corner Bakery And Cafe', email: `bakery${stamp}@example.com`, address: '9 Bakery Lane, Agra', ownerId: newOwnerId };
  r = await call('POST', '/admin/stores', { token: adminToken, body: storeBody });
  check('admin creates store with owner', r.status === 201 && r.data.data.ownerId === newOwnerId, JSON.stringify(r.data));
  r = await call('POST', '/admin/stores', { token: adminToken, body: { ...storeBody, email: `b2${stamp}@example.com` } });
  check('second store for same owner is 409', r.status === 409);
  r = await call('POST', '/admin/stores', { token: adminToken, body: storeBody });
  check('duplicate store email is 409', r.status === 409);
  r = await call('POST', '/admin/stores', { token: adminToken, body: { ...storeBody, email: `b3${stamp}@example.com`, ownerId: 2 } });
  check('owner who already has a store is rejected', r.status === 409);
  r = await call('POST', '/admin/stores', { token: adminToken, body: { ...storeBody, email: `b4${stamp}@example.com`, ownerId: 4 } });
  check('owner id of a normal user is 400', r.status === 400);
  r = await call('POST', '/admin/stores', { token: adminToken, body: { name: 'Short', email: 'bad', address: '' } });
  check('invalid store body is 400', r.status === 400 && !!r.data.errors.name && !!r.data.errors.email && !!r.data.errors.address);
  r = await call('POST', '/admin/stores', { token: adminToken, body: { name: 'Ownerless Store Without Owner', email: `noowner${stamp}@example.com`, address: 'Somewhere' } });
  check('store without owner is allowed', r.status === 201 && r.data.data.ownerId === null);
  r = await call('GET', '/admin/stores?sortBy=rating&order=desc&search=agra', { token: adminToken });
  check('admin store list with search + sort', r.status === 200 && r.data.data.length >= 2 && r.data.data[0].overallRating !== undefined);
  r = await call('GET', '/admin/stores?email=greenbasket', { token: adminToken });
  check('admin store email filter', r.data.data.length === 1 && r.data.data[0].ratingCount === 4);

  console.log('Owner');
  r = await call('GET', '/owner/dashboard', { token: ownerToken });
  check('owner sees own store only', r.status === 200 && r.data.data.store.name.startsWith('Green Basket') && r.data.data.store.totalRatings === 4 && r.data.data.store.averageRating === 4, JSON.stringify(r.data.data.store));
  check('owner rating rows have name, email, rating, date', r.data.data.ratings.length === 4 && r.data.data.ratings.every((x) => x.userName && x.userEmail && x.rating && x.date));
  r = await call('GET', '/owner/dashboard?sortBy=rating&order=desc&limit=2&page=1', { token: ownerToken });
  check('owner sort + pagination', r.data.data.ratings.length === 2 && r.data.data.ratings[0].rating === 5 && r.data.data.pagination.totalPages === 2);
  const owner2Token = await login('owner2@storerating.com', 'Owner@123');
  r = await call('GET', '/owner/dashboard', { token: owner2Token });
  check('second owner sees a different store', r.data.data.store.name.startsWith('Sunrise'));
  const newOwnerToken = await login(ownerNew.email, ownerNew.password);
  r = await call('GET', '/owner/dashboard', { token: newOwnerToken });
  check('owner with a store but no ratings gets empty list', r.data.data.store.averageRating === null && r.data.data.ratings.length === 0);

  console.log('Change password');
  r = await call('PATCH', '/auth/password', { token: userToken, body: { currentPassword: 'Wrong@1234', newPassword: 'NewPass@123' } });
  check('wrong current password is 400', r.status === 400 && !!r.data.errors.currentPassword);
  r = await call('PATCH', '/auth/password', { token: userToken, body: { currentPassword: 'Smoke@123', newPassword: 'weak' } });
  check('weak new password is 400', r.status === 400);
  r = await call('PATCH', '/auth/password', { token: userToken, body: { currentPassword: 'Smoke@123', newPassword: 'Smoke@123' } });
  check('same password is 400', r.status === 400);
  r = await call('PATCH', '/auth/password', { token: userToken, body: { currentPassword: 'Smoke@123', newPassword: 'NewPass@123' } });
  check('password change 200', r.status === 200);
  r = await call('POST', '/auth/login', { body: { email: newEmail, password: 'Smoke@123' } });
  check('old password no longer works', r.status === 401);
  r = await call('POST', '/auth/login', { body: { email: newEmail, password: 'NewPass@123' } });
  check('new password works', r.status === 200);
  r = await call('GET', '/auth/me', { token: userToken });
  check('me returns profile without password', r.status === 200 && r.data.data.password === undefined);

  console.log('Misc');
  r = await call('GET', '/nope', { token: userToken });
  check('unknown route is 404 JSON', r.status === 404 && !!r.data.message);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
};

run().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
