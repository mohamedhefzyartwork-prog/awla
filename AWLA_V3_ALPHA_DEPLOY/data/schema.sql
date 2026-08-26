
CREATE TABLE brands (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, market TEXT, category TEXT, objective TEXT,
  tone TEXT, palette_json TEXT, typography_json TEXT, always_rules_json TEXT, never_rules_json TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE skus (
  id TEXT PRIMARY KEY, brand_id TEXT NOT NULL, name TEXT NOT NULL, sku_code TEXT, category TEXT,
  metal TEXT, stones_json TEXT, immutable_rules_json TEXT, references_json TEXT, approved_angles_json TEXT,
  status TEXT, created_at TEXT NOT NULL
);
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY, brand_id TEXT NOT NULL, title TEXT, objective TEXT, market TEXT,
  visual_dna_json TEXT, status TEXT, created_at TEXT NOT NULL
);
CREATE TABLE content_units (
  id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, sku_id TEXT, role TEXT, creative_type TEXT,
  format TEXT, objective TEXT, visual_brief TEXT, execution_graph_json TEXT, qc_json TEXT,
  approval_state TEXT, created_at TEXT NOT NULL
);
CREATE TABLE approval_records (
  id TEXT PRIMARY KEY, content_unit_id TEXT NOT NULL, state TEXT NOT NULL, reasons_json TEXT,
  iteration INTEGER, reviewer TEXT, created_at TEXT NOT NULL
);
CREATE TABLE provider_runs (
  id TEXT PRIMARY KEY, content_unit_id TEXT, node_id TEXT, provider_id TEXT, model_id TEXT,
  capability TEXT, estimated_cost REAL, actual_cost REAL, latency_ms INTEGER, status TEXT,
  error TEXT, created_at TEXT NOT NULL
);
