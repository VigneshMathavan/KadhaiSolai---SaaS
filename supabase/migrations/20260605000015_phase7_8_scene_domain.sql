-- ============================================================
-- Phase 7.8: Task 2 & 3 - Scene Domain & Dataset Lineage Hardening
-- ============================================================

-- 1. Create the Scene Domain Entity
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  start_position INTEGER NOT NULL,
  end_position INTEGER NOT NULL,
  scene_type TEXT,
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT scenes_book_id_fkey FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT scenes_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- 2. Link Dataset Lineage to Scene and other Entities
-- dataset_lineage table needs strict constraints added to it
ALTER TABLE dataset_lineage
  ADD CONSTRAINT dataset_lineage_book_id_fkey FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
  ADD CONSTRAINT dataset_lineage_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE RESTRICT,
  ADD CONSTRAINT dataset_lineage_scene_id_fkey FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE RESTRICT,
  ADD CONSTRAINT dataset_lineage_dataset_version_id_fkey FOREIGN KEY (dataset_version_id) REFERENCES dataset_versions(id) ON DELETE RESTRICT,
  ADD CONSTRAINT dataset_lineage_corpus_version_id_fkey FOREIGN KEY (corpus_version_id) REFERENCES training_corpora(id) ON DELETE RESTRICT,
  
  -- Historical traceability must survive partial deletion (SET NULL)
  ADD CONSTRAINT dataset_lineage_dialogue_id_fkey FOREIGN KEY (dialogue_id) REFERENCES dialogues(id) ON DELETE SET NULL,
  ADD CONSTRAINT dataset_lineage_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
  ADD CONSTRAINT dataset_lineage_emotion_id_fkey FOREIGN KEY (emotion_id) REFERENCES emotions(id) ON DELETE SET NULL,
  ADD CONSTRAINT dataset_lineage_narration_id_fkey FOREIGN KEY (narration_id) REFERENCES narration_plans(id) ON DELETE SET NULL,
  ADD CONSTRAINT dataset_lineage_director_decision_id_fkey FOREIGN KEY (director_decision_id) REFERENCES director_decisions(id) ON DELETE SET NULL;
