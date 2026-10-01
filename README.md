# Store Rating Platform

A full-stack web app where users rate registered stores from 1 to 5. One login page serves three roles (ADMIN, USER, OWNER), and each role lands on its own dashboard.

## Features

**Everyone**
- Sign in with email and password, get a JWT, and land on the dashboard for your role
- Change your password
- Log out

**Normal user**
- Sign up
- Browse all stores, search by name and by address, sort by name, address or rating
- See each store's overall rating and your own rating
- Rate a store from 1 to 5 and edit that rating later (one rating per user per store)

**Store owner**
- Dashboard with the store name, average rating, total ratings and address
- Table of users who rated the store (name, email, rating, date) with sorting and pagination
- Sees only their own store's data

**Admin**
- Dashboard with total users, stores and ratings
- Add stores, normal users, admin users and store owners
- Store list (name, email, address, overall rating) and user list (name, email, address, role)
- Search, filter by role, sort ascending or descending, and paginate every list
- User details page, which also shows the store rating when the user is a store owner

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router DOM, Redux Toolkit, Axios, custom CSS |
| Backend | Node.js, Express, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv` |
| Database | PostgreSQL through the `pg` package (plain parameterized SQL) |

No ORM, no TypeScript, no other database.

## Folder structure

```text
store-rating-platform/
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/     auth, admin, store, rating, owner
│   │   ├── middleware/      authMiddleware, roleMiddleware, errorMiddleware
│   │   ├── routes/          auth, admin, store, rating, owner
│   │   ├── services/        all SQL lives here
│   │   ├── validators/      rules.js and one file per form group
│   │   ├── utils/           jwt, password, AppError, asyncHandler, query helpers
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/smoke.js       end-to-end API checks
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      Navbar, Sidebar, ProtectedRoute, RoleRoute, SearchBar,
    │   │                    RatingStars, DataTable, Modal, Pagination, FormField, Alert
    │   ├── pages/           auth/, admin/, user/, owner/, ChangePassword.jsx
    │   ├── redux/           store.js and slices/ (auth, store, user)
    │   ├── services/        api.js (Axios instance) and one file per API area
    │   ├── layouts/         AdminLayout, UserLayout, OwnerLayout, BaseLayout
    │   ├── hooks/           useDebounce, useTableQuery
    │   ├── utils/           validators, roles, storage, format
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    └── package.json
```

Request flow on the backend:

```text
Route -> Middleware (auth, role, validation) -> Controller -> Service -> PostgreSQL
```

## Database schema

Full SQL is in `backend/database/schema.sql`.

```text
users    id, name, email (unique), password, address, role, created_at, updated_at
stores   id, name, email (unique), address, owner_id (unique, nullable), created_at, updated_at
ratings  id, user_id, store_id, rating, created_at, updated_at
```

Constraints and design choices:
- `users.role` is checked to be `ADMIN`, `USER` or `OWNER`.
- `name` is checked to be 20 to 60 characters on users and stores.
- `ratings` has `UNIQUE (user_id, store_id)` and `CHECK (rating >= 1 AND rating <= 5)`.
- Foreign keys: `stores.owner_id` references users (`ON DELETE SET NULL`), `ratings.user_id` and `ratings.store_id` cascade on delete.
- `stores.owner_id` is `UNIQUE`, so an owner has at most one store. It is nullable so an admin can add a store before its owner exists. PostgreSQL allows many NULLs in a unique column.
- Indexes on `users.role`, `users.name`, `stores.name` and `ratings.store_id`. The unique constraints add their own indexes.
- Average rating is never stored. Every query calculates it with `AVG(r.rating)`.
- A trigger keeps `updated_at` current on every update.

## Environment variables

Backend, in `backend/.env` (copy from `.env.example`):

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/store_rating` | PostgreSQL connection string |
| `JWT_SECRET` | long random string | Signs tokens. The server will not start without it |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin, comma separated for several |
| `NODE_ENV` | `development` | Set `production` to hide internal error messages |

Frontend, in `frontend/.env` (copy from `.env.example`):

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the API |

## Installation

Requirements: Node.js 18 or newer, PostgreSQL 13 or newer, and the `psql` command line tool.

```bash
git clone <your-repo-url>
cd store-rating-platform

# backend
cd backend
npm install
cp .env.example .env        # then edit DATABASE_URL and JWT_SECRET

# frontend (new terminal)
cd frontend
npm install
cp .env.example .env
```

## PostgreSQL setup

Create the database (adjust the user if yours is different):

```bash
psql -U postgres -c "CREATE DATABASE store_rating;"
```

Make sure `DATABASE_URL` in `backend/.env` points to it, then create the tables:

```bash
cd backend
psql "postgresql://postgres:postgres@localhost:5432/store_rating" -f database/schema.sql
```

You can also run `npm run db:schema` if `DATABASE_URL` is exported in your shell. `schema.sql` is safe to run again.

## Seed data

```bash
psql "postgresql://postgres:postgres@localhost:5432/store_rating" -f database/seed.sql
```

The seed file creates 1 admin, 2 store owners, 5 normal users, 4 stores and 9 ratings. It first empties the three tables, so running it again resets the demo data. Passwords are stored as bcrypt hashes.

| Store | Owner | Ratings |
| --- | --- | --- |
| Green Basket Grocery Market | owner1 | 4 (average 4.0) |
| Sunrise Electronics Hub Store | owner2 | 3 (average 4.0) |
| Book Nook Reading Corner Shop | none | 2 (average 4.5) |
| Urban Threads Clothing Outlet | none | none, so it shows how a store without ratings looks |

## Run the project

Backend (port 5000):

```bash
cd backend
npm run dev      # restarts on file changes
# or
npm start
```

Frontend (port 5173):

```bash
cd frontend
npm run dev
```

Open http://localhost:5173. For a production build of the frontend, run `npm run build` in `frontend/`.

## Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@storerating.com` | `Admin@123` |
| Store owner (Green Basket) | `owner1@storerating.com` | `Owner@123` |
| Store owner (Sunrise Electronics) | `owner2@storerating.com` | `Owner@123` |
| User | `amit@example.com` | `User@123` |
| User | `neha@example.com` | `User@123` |
| User | `rohit@example.com` | `User@123` |
| User | `sneha@example.com` | `User@123` |
| User | `vikram@example.com` | `User@123` |

The login page has buttons that fill in the admin, owner and user demo accounts.

## Validation rules

Checked on the frontend (`frontend/src/utils/validators.js`) and again on the backend (`backend/src/validators/rules.js`).

| Field | Rule |
| --- | --- |
| Name | 20 to 60 characters |
| Address | Required, at most 400 characters |
| Password | 8 to 16 characters, at least one uppercase letter, at least one special character |
| Email | Standard email format |
| Rating | Whole number from 1 to 5 |

## API documentation

Base URL: `http://localhost:5000/api`. Protected routes need the header `Authorization: Bearer <token>`.

Success responses use `{ "data": ... }` (lists also include `pagination`) or `{ "message": ..., ... }`. Errors use `{ "message": "...", "errors": { "field": "..." } }`, where `errors` appears for validation and duplicate-email failures.

Status codes: 200 OK, 201 created, 400 validation error, 401 missing or invalid token or bad login, 403 wrong role, 404 not found, 409 duplicate (email, owner's store, or rating).

### Auth

| Method | Path | Access | Body |
| --- | --- | --- | --- |
| POST | `/auth/signup` | public | `name, email, password, address`. Creates a USER and returns `{ token, user }` |
| POST | `/auth/login` | public | `email, password`. Returns `{ token, user }` |
| GET | `/auth/me` | any logged-in user | Returns the current profile |
| PATCH | `/auth/password` | any logged-in user | `currentPassword, newPassword` |

The JWT payload is `{ userId, role }`. On every request the server loads the user from the database, so a deleted user or a changed role takes effect right away.

### Admin (role ADMIN)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/admin/dashboard` | `{ totalUsers, totalStores, totalRatings }` |
| GET | `/admin/users` | Paginated users. Filters: `search, name, email, address, role`. Sort: `name, email, address, role, createdAt` |
| POST | `/admin/users` | `name, email, password, address, role` where role is `USER`, `ADMIN` or `OWNER` |
| GET | `/admin/users/:id` | User details. Owners include `store: { name, rating, ratingCount }` |
| GET | `/admin/stores` | Paginated stores. Filters: `search, name, email, address`. Sort: `name, email, address, rating, createdAt` |
| POST | `/admin/stores` | `name, email, address, ownerId` (ownerId optional, must be an owner without a store) |
| GET | `/admin/owners` | Owners that do not have a store yet, used by the Add store form |

### Stores (any logged-in user)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/stores` | Paginated list. Filters: `search` (name or address), `name`, `address`. Sort: `name, address, rating`. Each item has `overallRating`, `ratingCount` and `userRating` |
| GET | `/stores/:id` | One store in the same shape |

### Ratings (role USER)

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| POST | `/stores/:storeId/rating` | `{ "rating": 4 }` | First rating. Returns 409 if the user already rated this store |
| PUT | `/stores/:storeId/rating` | `{ "rating": 5 }` | Changes the existing rating. Returns 404 if there is none |

Both return the refreshed store with the new average.

### Owner (role OWNER)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/owner/dashboard` | `{ store, ratings, pagination }` for the logged-in owner's store. Sort: `name, email, rating, date`. `store` is `null` when no store is assigned |

The store is found from the token, never from a request parameter, so an owner cannot read another store.

### Query parameters

```text
GET /api/admin/users?search=rahul&role=USER&sortBy=name&order=asc&page=1&limit=10
```

- `page` starts at 1. `limit` defaults to 10 and is capped at 50.
- `order` is `asc` or `desc`. An unknown `sortBy` falls back to the default column, so user input never reaches the SQL `ORDER BY`.
- Search uses `ILIKE` and treats `%` and `_` as normal characters.
- Lists return `pagination: { page, limit, total, totalPages }`.

Example:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@storerating.com","password":"Admin@123"}'
```

## Security notes

- Passwords are hashed with bcrypt (10 rounds). Hashes are never returned by any endpoint and never placed in the JWT.
- Every SQL statement uses `$1, $2, ...` placeholders. Sort columns come from a fixed whitelist.
- Authorization is enforced by the backend (`authenticate` then `authorize(...)`). The frontend route guards only keep the interface tidy.
- Login returns the same message for an unknown email and a wrong password.
- Duplicate emails and duplicate ratings are stopped by database constraints and returned as 409.
- CORS is limited to `CLIENT_URL`. Request bodies are limited to 100 KB.

## Testing instructions

### Automated API smoke test

The test checks signup, login, validation, roles, search, sorting, pagination, ratings, admin actions, owner isolation and password change (79 checks).

```bash
# 1. reload the seed data so counts are predictable
psql "postgresql://postgres:postgres@localhost:5432/store_rating" -f backend/database/seed.sql

# 2. start the API in one terminal
cd backend && npm start

# 3. run the test in another terminal
cd backend && npm run test:smoke
```

Set `API_URL` if the API is not on `http://localhost:5000/api`. Run the seed again before every run, because the test creates records.

### Manual walkthrough

1. Open the app and sign up with a name of at least 20 characters. You should land on the store list.
2. Search `green` in the store name box, then clear it and search an address such as `Mathura`.
3. Click a column header twice to sort ascending and then descending.
4. Click **Rate** on a store, pick stars, save. The button becomes **Edit rating**. Edit it and check the average changes.
5. Try to open `/admin` while logged in as a user. You are sent back to the store list.
6. Log out, log in as `owner1@storerating.com`. The dashboard shows Green Basket with 4 ratings.
7. Log in as `admin@storerating.com`. Check the dashboard counts, filter users by role, open an owner's details page, and add a store.
8. On any account, open **Change password** and try a weak password to see the validation messages.

### Edge cases covered

Duplicate ratings, ratings outside 1 to 5, non-integer and empty ratings, weak passwords, duplicate emails, stores without ratings (average shows as null and the UI shows "No ratings yet"), invalid IDs, missing records, unknown sort columns, unauthorized and wrong-role access.

## Notes for interviews

- **Why a service layer?** Controllers only read the request and send the response. Services hold all SQL, so each file has one job.
- **Why `AVG()` instead of a stored average?** A stored number can drift from the real data. The query is cheap with the `ratings.store_id` index.
- **How is one rating per store enforced?** By `UNIQUE (user_id, store_id)` in the database. The API maps the violation to a 409, which also covers two requests arriving at the same time.
- **How are stale search results avoided?** Text filters are debounced by 400 ms, and each Redux list ignores responses from older requests.
- **Why is `owner_id` nullable and unique?** An owner has one store and the seed has 2 owners with 4 stores, so 2 stores start without an owner.
