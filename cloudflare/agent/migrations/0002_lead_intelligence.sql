CREATE TABLE IF NOT EXISTS lead_sessions (
  session_hash TEXT PRIMARY KEY,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  language TEXT,
  landing_page TEXT,
  utm_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'anonymous',
  consented INTEGER NOT NULL DEFAULT 0,
  conversation_summary TEXT
);

CREATE TABLE IF NOT EXISTS lead_profiles (
  session_hash TEXT PRIMARY KEY,
  goal TEXT,
  business_type TEXT,
  offer TEXT,
  audience TEXT,
  budget_slug TEXT,
  timeline_slug TEXT,
  service_slug TEXT,
  urgency TEXT,
  url_hostname_hash TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  session_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  source TEXT,
  consent_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  owner_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_diagnostics (
  session_hash TEXT PRIMARY KEY,
  lead_score INTEGER NOT NULL DEFAULT 0,
  confidence INTEGER NOT NULL DEFAULT 0,
  primary_service TEXT,
  support_services_json TEXT NOT NULL DEFAULT '[]',
  blockers_json TEXT NOT NULL DEFAULT '[]',
  next_best_action TEXT,
  score_signals_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_briefs (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  session_hash TEXT NOT NULL,
  summary TEXT,
  notes TEXT,
  budget TEXT,
  timeline TEXT,
  service_slug TEXT,
  artifact_r2_key TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_audits (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  session_hash TEXT NOT NULL,
  hostname_hash TEXT,
  title TEXT,
  h1 TEXT,
  clarity_score INTEGER,
  conversion_score INTEGER,
  findings_json TEXT NOT NULL DEFAULT '[]',
  report_r2_key TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  session_hash TEXT NOT NULL,
  lead_id TEXT,
  service_slug TEXT,
  score_band INTEGER,
  page TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_tasks (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  session_hash TEXT,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  due_at TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  completed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_rollups (
  day TEXT PRIMARY KEY,
  chats INTEGER NOT NULL DEFAULT 0,
  audits INTEGER NOT NULL DEFAULT 0,
  briefs INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  hot_leads INTEGER NOT NULL DEFAULT 0,
  service_demand_json TEXT NOT NULL DEFAULT '{}',
  conversion_rate REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS consent_events (
  id TEXT PRIMARY KEY,
  session_hash TEXT NOT NULL,
  lead_id TEXT,
  scope TEXT NOT NULL,
  copy_version TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_sessions_last_seen
  ON lead_sessions (last_seen_at);

CREATE INDEX IF NOT EXISTS idx_leads_created_status
  ON leads (created_at, status);

CREATE INDEX IF NOT EXISTS idx_leads_session_hash
  ON leads (session_hash);

CREATE INDEX IF NOT EXISTS idx_lead_diagnostics_score
  ON lead_diagnostics (lead_score);

CREATE INDEX IF NOT EXISTS idx_lead_briefs_session
  ON lead_briefs (session_hash, created_at);

CREATE INDEX IF NOT EXISTS idx_lead_audits_session
  ON lead_audits (session_hash, created_at);

CREATE INDEX IF NOT EXISTS idx_lead_events_session_created
  ON lead_events (session_hash, created_at);

CREATE INDEX IF NOT EXISTS idx_lead_events_type_created
  ON lead_events (event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_lead_events_service_created
  ON lead_events (service_slug, created_at);

CREATE INDEX IF NOT EXISTS idx_lead_tasks_status_due
  ON lead_tasks (status, due_at);
