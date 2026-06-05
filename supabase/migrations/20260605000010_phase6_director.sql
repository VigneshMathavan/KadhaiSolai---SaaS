-- Phase 6: Audiobook Director Master Layer

CREATE TABLE audiobook_master_plans (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  global_objectives JSONB NOT NULL,
  continuity_rules JSONB NOT NULL,
  performance_rules JSONB NOT NULL,
  quality_rules JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_blueprints (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  chapter_plans JSONB NOT NULL,
  scene_plans JSONB NOT NULL,
  character_plans JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_directives (
  id UUID PRIMARY KEY,
  blueprint_id UUID REFERENCES production_blueprints(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  directive_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL
);

CREATE TABLE voice_casting_plans (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  character_id UUID NOT NULL,
  voice_archetype VARCHAR(100) NOT NULL,
  casting_confidence FLOAT NOT NULL,
  casting_reasoning JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_timelines (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  timeline_data JSONB NOT NULL
);

CREATE TABLE director_decisions (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  decision_type VARCHAR(50) NOT NULL,
  confidence FLOAT NOT NULL,
  reasoning JSONB NOT NULL,
  evidence JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE director_reviews (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  review_status VARCHAR(50) NOT NULL,
  feedback JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_risks (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  risk_type VARCHAR(50) NOT NULL,
  severity FLOAT NOT NULL,
  description TEXT NOT NULL,
  mitigation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_quality_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  trace_id UUID NOT NULL,
  casting_quality FLOAT NOT NULL,
  consistency_quality FLOAT NOT NULL,
  resolution_quality FLOAT NOT NULL,
  overall_score FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
