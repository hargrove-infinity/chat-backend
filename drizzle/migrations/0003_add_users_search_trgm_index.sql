-- Custom SQL migration file, put your code below! --
CREATE INDEX users_search_trgm_idx ON users
USING gin (
  (first_name || ' ' || last_name || ' ' || email) gin_trgm_ops
);