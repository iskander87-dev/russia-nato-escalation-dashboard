CREATE TABLE subscriptions (
  email TEXT PRIMARY KEY NOT NULL,
  manage_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at);
