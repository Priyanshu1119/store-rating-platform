-- Store Rating Platform schema (PostgreSQL).
-- Safe to run more than once: objects are only created when missing.

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(60)  NOT NULL,
  email       VARCHAR(255) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  address     VARCHAR(400) NOT NULL,
  role        VARCHAR(10)  NOT NULL DEFAULT 'USER',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'USER', 'OWNER')),
  CONSTRAINT users_name_length_check CHECK (char_length(name) BETWEEN 20 AND 60)
);

-- owner_id is nullable so an admin can add a store before its owner exists.
-- UNIQUE(owner_id) gives every owner at most one store (NULLs are allowed many times).
CREATE TABLE IF NOT EXISTS stores (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(60)  NOT NULL,
  email       VARCHAR(255) NOT NULL,
  address     VARCHAR(400) NOT NULL,
  owner_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT stores_email_key UNIQUE (email),
  CONSTRAINT stores_owner_id_key UNIQUE (owner_id),
  CONSTRAINT stores_name_length_check CHECK (char_length(name) BETWEEN 20 AND 60)
);

CREATE TABLE IF NOT EXISTS ratings (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ratings_user_id_store_id_key UNIQUE (user_id, store_id),
  CONSTRAINT ratings_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- Indexes for filtering, joins and aggregates.
CREATE INDEX IF NOT EXISTS idx_users_role       ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_name       ON users (name);
CREATE INDEX IF NOT EXISTS idx_stores_name      ON stores (name);
CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings (store_id);

-- Keeps updated_at current on every UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_stores_updated_at ON stores;
CREATE TRIGGER trg_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ratings_updated_at ON ratings;
CREATE TRIGGER trg_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
