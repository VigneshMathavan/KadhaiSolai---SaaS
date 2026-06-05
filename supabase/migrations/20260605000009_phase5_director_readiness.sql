-- Phase 5.1: Director Readiness

CREATE TABLE narrative_arcs (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  arc_type VARCHAR(50) NOT NULL,
  arc_position FLOAT NOT NULL,
  arc_confidence FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scene_graphs (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  graph_snapshot JSONB NOT NULL,
  connectivity_score FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scene_relationships (
  id UUID PRIMARY KEY,
  graph_id UUID REFERENCES scene_graphs(id) ON DELETE CASCADE,
  source_scene UUID NOT NULL,
  target_scene UUID NOT NULL,
  relationship_type VARCHAR(50) NOT NULL,
  weight FLOAT NOT NULL
);

CREATE TABLE directorial_intents (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  scene_id UUID NOT NULL,
  intent_type VARCHAR(50) NOT NULL,
  confidence FLOAT NOT NULL,
  reasoning JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE momentum_profiles (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  momentum_score FLOAT NOT NULL,
  momentum_direction VARCHAR(50) NOT NULL,
  momentum_trend VARCHAR(50) NOT NULL,
  momentum_velocity FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scene_importance_reports (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  scene_id UUID NOT NULL,
  importance_score FLOAT NOT NULL,
  reasoning JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
