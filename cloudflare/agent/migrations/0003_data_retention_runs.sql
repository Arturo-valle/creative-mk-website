CREATE TABLE IF NOT EXISTS data_retention_runs (
  id TEXT PRIMARY KEY,
  ran_at TEXT NOT NULL,
  anonymous_cutoff TEXT NOT NULL,
  event_cutoff TEXT NOT NULL,
  task_cutoff TEXT NOT NULL,
  anonymous_sessions_deleted INTEGER NOT NULL DEFAULT 0,
  orphan_profiles_deleted INTEGER NOT NULL DEFAULT 0,
  orphan_diagnostics_deleted INTEGER NOT NULL DEFAULT 0,
  anonymous_events_deleted INTEGER NOT NULL DEFAULT 0,
  completed_tasks_deleted INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_data_retention_runs_ran_at
  ON data_retention_runs (ran_at);
