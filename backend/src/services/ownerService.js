const { query } = require('../config/db');
const { parsePagination, buildPagination, parseSort } = require('../utils/query');

const SORTABLE = {
  name: 'u.name',
  email: 'u.email',
  rating: 'r.rating',
  date: 'r.updated_at',
};

// The store is found through the logged-in owner's id. No store id is ever read from the request,
// so an owner cannot see another owner's data.
const getDashboard = async (ownerId, queryParams) => {
  const paging = parsePagination(queryParams);
  const sort = parseSort(queryParams, SORTABLE, 'date');
  const order = queryParams.sortBy ? sort.order : 'DESC';

  const storeResult = await query(
    `SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating)::numeric, 1)::float AS average_rating,
            COUNT(r.id)::int AS total_ratings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1
     GROUP BY s.id`,
    [ownerId]
  );

  if (storeResult.rows.length === 0) {
    return { store: null, ratings: [], pagination: buildPagination(paging, 0) };
  }

  const store = storeResult.rows[0];
  const { rows } = await query(
    `SELECT r.id, u.name AS user_name, u.email AS user_email, r.rating, r.updated_at AS date
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY ${sort.column} ${order}, r.id ASC
     LIMIT $2 OFFSET $3`,
    [store.id, paging.limit, paging.offset]
  );

  return {
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating: store.average_rating,
      totalRatings: store.total_ratings,
    },
    ratings: rows.map((row) => ({
      id: row.id,
      userName: row.user_name,
      userEmail: row.user_email,
      rating: row.rating,
      date: row.date,
    })),
    pagination: buildPagination(paging, store.total_ratings),
  };
};

module.exports = { getDashboard };
