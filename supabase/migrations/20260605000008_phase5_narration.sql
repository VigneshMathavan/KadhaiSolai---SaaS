-- Phase 5: Narration Intelligence Layer

CREATE TABLE narration_plans (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  total_scenes INTEGER NOT NULL,
  pacing_score FLOAT NOT NULL,
  complexity_score FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE narration_directives (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES narration_plans(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  directive_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scene_directives (
  id UUID PRIMARY KEY,
  directive_id UUID REFERENCES narration_directives(id) ON DELETE CASCADE,
  mood VARCHAR(50) NOT NULL,
  energy FLOAT NOT NULL,
  tension FLOAT NOT NULL,
  pacing VARCHAR(50) NOT NULL
);

CREATE TABLE pause_directives (
  id UUID PRIMARY KEY,
  directive_id UUID REFERENCES narration_directives(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  pause_type VARCHAR(50) NOT NULL
);

CREATE TABLE emphasis_directives (
  id UUID PRIMARY KEY,
  directive_id UUID REFERENCES narration_directives(id) ON DELETE CASCADE,
  start_position INTEGER NOT NULL,
  end_position INTEGER NOT NULL,
  emphasis_level FLOAT NOT NULL,
  emphasis_type VARCHAR(50) NOT NULL
);

CREATE TABLE transition_directives (
  id UUID PRIMARY KEY,
  directive_id UUID REFERENCES narration_directives(id) ON DELETE CASCADE,
  from_scene UUID,
  to_scene UUID,
  transition_type VARCHAR(50) NOT NULL,
  duration_ms INTEGER NOT NULL
);

CREATE TABLE narration_timelines (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES narration_plans(id) ON DELETE CASCADE,
  timeline_data JSONB NOT NULL
);

CREATE TABLE narration_quality_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL,
  trace_id UUID NOT NULL,
  pacing_quality FLOAT NOT NULL,
  pause_quality FLOAT NOT NULL,
  transition_quality FLOAT NOT NULL,
  performance_quality FLOAT NOT NULL,
  overall_score FLOAT NOT NULL,
  validation_issues JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
