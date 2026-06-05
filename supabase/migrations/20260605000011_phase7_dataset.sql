-- Phase 7: Dataset Factory

CREATE TABLE training_corpora (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  version_id UUID NOT NULL,
  total_samples INTEGER NOT NULL,
  quality_score FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_samples (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  sample_id VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  speaker VARCHAR(255) NOT NULL,
  emotion VARCHAR(50) NOT NULL,
  emotion_intensity FLOAT NOT NULL,
  emotion_persistence FLOAT NOT NULL,
  pacing VARCHAR(50) NOT NULL,
  pauses JSONB NOT NULL,
  emphasis JSONB NOT NULL,
  narrative_arc VARCHAR(100) NOT NULL,
  directorial_intent VARCHAR(100) NOT NULL,
  voice_archetype VARCHAR(100) NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS dataset_versions CASCADE;
CREATE TABLE dataset_versions (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  version_tag VARCHAR(50) NOT NULL,
  diff_metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_manifests (
  id UUID PRIMARY KEY,
  version_id UUID REFERENCES dataset_versions(id) ON DELETE CASCADE,
  manifest_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS dataset_exports CASCADE;
CREATE TABLE dataset_exports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  export_format VARCHAR(50) NOT NULL,
  export_profile JSONB NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_registry (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  registry_snapshot JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_quality_reports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  quality_score FLOAT NOT NULL,
  reasoning JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_balance_reports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  balance_score FLOAT NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_coverage_reports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  coverage_score FLOAT NOT NULL,
  gaps JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
