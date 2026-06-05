-- Phase 7 Provenance Patch: Dataset Lineage

CREATE TABLE dataset_lineage (
  id UUID PRIMARY KEY,
  sample_id UUID REFERENCES training_samples(id) ON DELETE CASCADE,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  scene_id UUID NOT NULL,
  dialogue_id UUID,
  character_id UUID NOT NULL,
  emotion_id UUID,
  narration_id UUID,
  director_decision_id UUID,
  dataset_version_id UUID NOT NULL,
  corpus_version_id UUID NOT NULL,
  trace_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_usage (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  model_id VARCHAR(255) NOT NULL,
  usage_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_history (
  id UUID PRIMARY KEY,
  model_id VARCHAR(255) NOT NULL,
  history_metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE version_diffs (
  id UUID PRIMARY KEY,
  previous_version_id UUID REFERENCES dataset_versions(id) ON DELETE CASCADE,
  current_version_id UUID REFERENCES dataset_versions(id) ON DELETE CASCADE,
  diff_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE corpus_lineage_reports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  lineage_coverage FLOAT NOT NULL,
  missing_links INTEGER NOT NULL,
  broken_references INTEGER NOT NULL,
  orphan_samples INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
