-- Kumo One: per-session sign-out (see lib/db/schema/auth.ts authRevokedSessions).
CREATE TABLE IF NOT EXISTS auth_revoked_sessions (
  sid varchar(64) PRIMARY KEY,
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  revoked_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_revoked_sessions_revoked_at_idx ON auth_revoked_sessions (revoked_at);
