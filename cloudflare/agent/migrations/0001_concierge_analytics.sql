CREATE TABLE IF NOT EXISTS concierge_events (
  id TEXT PRIMARY KEY,
  session_hash TEXT NOT NULL,
  event_type TEXT NOT NULL,
  language TEXT,
  service_slug TEXT,
  lead_score INTEGER,
  hostname_hash TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_concierge_events_created_at
  ON concierge_events (created_at);

CREATE INDEX IF NOT EXISTS idx_concierge_events_type_created_at
  ON concierge_events (event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_concierge_events_service_created_at
  ON concierge_events (service_slug, created_at);
