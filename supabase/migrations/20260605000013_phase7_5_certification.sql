-- Phase 7.5: Platform Certification

CREATE TABLE platform_certifications (
  id UUID PRIMARY KEY,
  certification_status VARCHAR(50) NOT NULL,
  certification_score FLOAT NOT NULL,
  production_approval BOOLEAN NOT NULL,
  phase8_approval BOOLEAN NOT NULL,
  required_fixes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_reports (
  id UUID PRIMARY KEY,
  certification_id UUID REFERENCES platform_certifications(id) ON DELETE CASCADE,
  audit_type VARCHAR(100) NOT NULL,
  health_score FLOAT NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stress_test_reports (
  id UUID PRIMARY KEY,
  certification_id UUID REFERENCES platform_certifications(id) ON DELETE CASCADE,
  word_count INTEGER NOT NULL,
  cpu_usage FLOAT NOT NULL,
  memory_usage FLOAT NOT NULL,
  throughput FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE readiness_reports (
  id UUID PRIMARY KEY,
  certification_id UUID REFERENCES platform_certifications(id) ON DELETE CASCADE,
  readiness_score FLOAT NOT NULL,
  blockers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
