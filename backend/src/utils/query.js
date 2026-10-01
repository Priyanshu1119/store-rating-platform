const AppError = require('./AppError');

const MAX_LIMIT = 50;
const MAX_INT = 2147483647;

// Escapes % and _ so user input is matched literally inside ILIKE.
const escapeLike = (value) => String(value).replace(/[\\%_]/g, '\\$&');
const likePattern = (value) => `%${escapeLike(value)}%`;

const parseId = (value, label = 'id') => {
  if (!/^\d+$/.test(String(value))) throw new AppError(400, `Invalid ${label}`);
  const id = Number(value);
  if (id < 1 || id > MAX_INT) throw new AppError(400, `Invalid ${label}`);
  return id;
};

const parsePagination = (query) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  limit = Math.min(limit, MAX_LIMIT);
  return { page, limit, offset: (page - 1) * limit };
};

const buildPagination = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

// `allowed` maps the public sort key to a real SQL expression. Anything else falls back to the default.
const parseSort = (query, allowed, defaultKey) => {
  const key = Object.prototype.hasOwnProperty.call(allowed, query.sortBy) ? query.sortBy : defaultKey;
  const order = String(query.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return { key, column: allowed[key], order };
};

// Collects WHERE conditions with numbered placeholders.
// Use `$$` in a template where the parameter number should go.
const createFilter = () => {
  const conditions = [];
  const params = [];
  return {
    params,
    add(template, value) {
      params.push(value);
      conditions.push(template.replace(/\$\$/g, () => `$${params.length}`));
    },
    where() {
      return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    },
  };
};

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

module.exports = {
  parseId,
  parsePagination,
  buildPagination,
  parseSort,
  createFilter,
  likePattern,
  asText,
};
