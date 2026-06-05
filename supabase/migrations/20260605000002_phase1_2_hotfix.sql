-- ============================================================
-- Kadhaisolai Phase 1.2 Hotfix - Chapter Fusion & Quality
-- ============================================================

alter table chapters 
add column if not exists detection_evidence jsonb,
add column if not exists fusion_confidence numeric(4,3),
add column if not exists quality_score numeric(4,3);

-- Create a dedicated table to store book-level quality reports if needed, 
-- but storing quality_score on chapters is sufficient for now based on requirements.
