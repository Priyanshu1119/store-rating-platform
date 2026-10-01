const { query } = require('../config/db');
const AppError = require('../utils/AppError');
const {
  parsePagination,
  buildPagination,
  parseSort,
  createFilter,
  likePattern,
  asText,
} = require('../utils/query');

const SORTABLE = {
  name: 's.name',
  address: 's.address',
  rating: 'AVG(r.rating)',
};

// Average is calculated with AVG() on every request and never stored in the stores table.
const mapStore = (row) => ({
  id: row.id,
  name: row.name,
  address: row.address,
  overallRating: row.overall_rating,
  ratingCount: row.rating_count,
  userRating: row.user_rating,
});

const listStores = async (userId, queryParams) => {
  const paging = parsePagination(queryParams);
  const sort = parseSort(queryParams, SORTABLE, 'name');

  const filter = createFilter();
  const search = asText(queryParams.search);
  const name = asText(queryParams.name);
  const address = asText(queryParams.address);
  if (search) filter.add('(s.name ILIKE $$ OR s.address ILIKE $$)', likePattern(search));
  if (name) filter.add('s.name ILIKE $$', likePattern(name));
  if (address) filter.add('s.address ILIKE $$', likePattern(address));

  const countResult = await query(`SELECT COUNT(*)::int AS total FROM stores s ${filter.where()}`, filter.params);
  const total = countResult.rows[0].total;

  // The current user's rating is a subquery so it cannot change the AVG() of the join.
  const userIdIndex = filter.params.length + 1;
  const limitIndex = filter.params.length + 2;
  const offsetIndex = filter.params.length + 3;

  const { rows } = await query(
    `SELECT s.id, s.name, s.address,
            ROUND(AVG(r.rating)::numeric, 1)::float AS overall_rating,
            COUNT(r.id)::int AS rating_count,
            (SELECT ur.rating FROM ratings ur WHERE ur.store_id = s.id AND ur.user_id = $${userIdIndex}) AS user_rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${filter.where()}
     GROUP BY s.id
     ORDER BY ${sort.column} ${sort.order} NULLS LAST, s.id ASC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    [...filter.params, userId, paging.limit, paging.offset]
  );

  return { data: rows.map(mapStore), pagination: buildPagination(paging, total) };
};

const getStoreById = async (userId, storeId) => {
  const { rows } = await query(
    `SELECT s.id, s.name, s.address,
            ROUND(AVG(r.rating)::numeric, 1)::float AS overall_rating,
            COUNT(r.id)::int AS rating_count,
            (SELECT ur.rating FROM ratings ur WHERE ur.store_id = s.id AND ur.user_id = $1) AS user_rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = $2
     GROUP BY s.id`,
    [userId, storeId]
  );
  if (rows.length === 0) throw new AppError(404, 'Store not found');
  return mapStore(rows[0]);
};

module.exports = { listStores, getStoreById };
