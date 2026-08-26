
CREATE TABLE IF NOT EXISTS tool_connections (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  auth_type TEXT NOT NULL,
  encrypted_secret TEXT,
  secret_iv TEXT,
  external_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'CONNECTED',
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, provider_id)
);

CREATE TABLE IF NOT EXISTS provider_runs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  content_unit_id TEXT,
  provider_id TEXT NOT NULL,
  capability TEXT NOT NULL,
  model_id TEXT,
  status TEXT NOT NULL,
  estimated_cost REAL DEFAULT 0,
  actual_cost REAL DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  error TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_connections_workspace ON tool_connections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_runs_workspace ON provider_runs(workspace_id);
