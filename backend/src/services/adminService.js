const { query } = require('../config/db');
const AppError = require('../utils/AppError');
const { hashPassword } = require('../utils/password');
const { ROLES } = require('../validators/rules');
const {
  parseId,
  parsePagination,
  buildPagination,
  parseSort,
  createFilter,
  likePattern,
  asText,
} = require('../utils/query');

const USER_SORTABLE = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: 'u.role',
  createdAt: 'u.created_at',
};

const STORE_SORTABLE = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'AVG(r.rating)',
  createdAt: 's.created_at',
};

const getDashboard = async () => {
  const { rows } = await query(
    `SELECT (SELECT COUNT(*) FROM users)::int   AS total_users,
            (SELECT COUNT(*) FROM stores)::int  AS total_stores,
            (SELECT COUNT(*) FROM ratings)::int AS total_ratings`
  );
  return {
    totalUsers: rows[0].total_users,
    totalStores: rows[0].total_stores,
    totalRatings: rows[0].total_ratings,
  };
};

const listUsers = async (queryParams) => {
  const paging = parsePagination(queryParams);
  const sort = parseSort(queryParams, USER_SORTABLE, 'name');

  const filter = createFilter();
  const search = asText(queryParams.search);
  const name = asText(queryParams.name);
  const email = asText(queryParams.email);
  const address = asText(queryParams.address);
  const role = asText(queryParams.role).toUpperCase();

  if (search) filter.add('(u.name ILIKE $$ OR u.email ILIKE $$ OR u.address ILIKE $$)', likePattern(search));
  if (name) filter.add('u.name ILIKE $$', likePattern(name));
  if (email) filter.add('u.email ILIKE $$', likePattern(email));
  if (address) filter.add('u.address ILIKE $$', likePattern(address));
  if (role) {
    if (!ROLES.includes(role)) throw new AppError(400, 'Role filter must be ADMIN, USER or OWNER');
    filter.add('u.role = $$', role);
  }

  const countResult = await query(`SELECT COUNT(*)::int AS total FROM users u ${filter.where()}`, filter.params);
  const total = countResult.rows[0].total;

  const limitIndex = filter.params.length + 1;
  const offsetIndex = filter.params.length + 2;
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.address, u.role
     FROM users u
     ${filter.where()}
     ORDER BY ${sort.column} ${sort.order}, u.id ASC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    [...filter.params, paging.limit, paging.offset]
  );

  return { data: rows, pagination: buildPagination(paging, total) };
};

const getUserById = async (idParam) => {
  const id = parseId(idParam, 'user id');
  const { rows } = await query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
    [id]
  );
  if (rows.length === 0) throw new AppError(404, 'User not found');

  const user = {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    address: rows[0].address,
    role: rows[0].role,
    createdAt: rows[0].created_at,
  };

  // Owners also get their store and its rating.
  if (user.role === 'OWNER') {
    const storeResult = await query(
      `SELECT s.id, s.name,
              ROUND(AVG(r.rating)::numeric, 1)::float AS rating,
              COUNT(r.id)::int AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [id]
    );
    const store = storeResult.rows[0];
    user.store = store
      ? { id: store.id, name: store.name, rating: store.rating, ratingCount: store.rating_count }
      : null;
  }

  return user;
};

const createUser = async ({ name, email, password, address, role }) => {
  const hash = await hashPassword(password);
  const { rows } = await query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role`,
    [name, email, hash, address, role]
  );
  return rows[0];
};

const listStores = async (queryParams) => {
  const paging = parsePagination(queryParams);
  const sort = parseSort(queryParams, STORE_SORTABLE, 'name');

  const filter = createFilter();
  const search = asText(queryParams.search);
  const name = asText(queryParams.name);
  const email = asText(queryParams.email);
  const address = asText(queryParams.address);

  if (search) filter.add('(s.name ILIKE $$ OR s.email ILIKE $$ OR s.address ILIKE $$)', likePattern(search));
  if (name) filter.add('s.name ILIKE $$', likePattern(name));
  if (email) filter.add('s.email ILIKE $$', likePattern(email));
  if (address) filter.add('s.address ILIKE $$', likePattern(address));

  const countResult = await query(`SELECT COUNT(*)::int AS total FROM stores s ${filter.where()}`, filter.params);
  const total = countResult.rows[0].total;

  const limitIndex = filter.params.length + 1;
  const offsetIndex = filter.params.length + 2;
  const { rows } = await query(
    `SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating)::numeric, 1)::float AS overall_rating,
            COUNT(r.id)::int AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${filter.where()}
     GROUP BY s.id
     ORDER BY ${sort.column} ${sort.order} NULLS LAST, s.id ASC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    [...filter.params, paging.limit, paging.offset]
  );

  const data = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    overallRating: row.overall_rating,
    ratingCount: row.rating_count,
  }));

  return { data, pagination: buildPagination(paging, total) };
};

const createStore = async ({ name, email, address, ownerId }) => {
  if (ownerId !== null) {
    const owner = await query("SELECT id FROM users WHERE id = $1 AND role = 'OWNER'", [ownerId]);
    if (owner.rows.length === 0) {
      throw new AppError(400, 'Validation failed', { ownerId: 'Selected user is not a store owner' });
    }
  }

  const { rows } = await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id`,
    [name, email, address, ownerId]
  );
  const store = rows[0];
  return { id: store.id, name: store.name, email: store.email, address: store.address, ownerId: store.owner_id };
};

// Owners that do not have a store yet. Used by the "Add store" form.
const listAvailableOwners = async () => {
  const { rows } = await query(
    `SELECT u.id, u.name, u.email
     FROM users u
     WHERE u.role = 'OWNER' AND NOT EXISTS (SELECT 1 FROM stores s WHERE s.owner_id = u.id)
     ORDER BY u.name ASC`
  );
  return rows;
};

module.exports = {
  getDashboard,
  listUsers,
  getUserById,
  createUser,
  listStores,
  createStore,
  listAvailableOwners,
};
