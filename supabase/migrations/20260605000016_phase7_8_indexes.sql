-- ============================================================
-- Phase 7.8: Task 4 - Index Hardening
-- ============================================================

-- Books & Chapters
CREATE INDEX IF NOT EXISTS idx_scenes_book_id ON scenes(book_id);
CREATE INDEX IF NOT EXISTS idx_scenes_chapter_id ON scenes(chapter_id);

-- Characters
-- idx_characters_book_id already exists

-- Conversations
-- idx_conversations_book_id already exists
CREATE INDEX IF NOT EXISTS idx_conversations_chapter_id ON conversations(chapter_id);

-- Dialogues
-- idx_dialogues_book_id and idx_dialogues_chapter_id already exist
CREATE INDEX IF NOT EXISTS idx_dialogues_conversation_id ON dialogues(conversation_id);

-- Emotions
-- idx_emotions_book_id and idx_emotions_chapter_id exist
CREATE INDEX IF NOT EXISTS idx_emotions_character_id ON emotions(character_id);
CREATE INDEX IF NOT EXISTS idx_emotions_conversation_id ON emotions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_emotions_dialogue_id ON emotions(dialogue_id);

-- Narration
CREATE INDEX IF NOT EXISTS idx_narration_plans_book_id ON narration_plans(book_id);
CREATE INDEX IF NOT EXISTS idx_narration_plans_chapter_id ON narration_plans(chapter_id);
CREATE INDEX IF NOT EXISTS idx_narration_directives_plan_id ON narration_directives(plan_id);

-- Director
CREATE INDEX IF NOT EXISTS idx_audiobook_master_plans_book_id ON audiobook_master_plans(book_id);
CREATE INDEX IF NOT EXISTS idx_director_decisions_plan_id ON director_decisions(plan_id);

-- Dataset & Lineage
CREATE INDEX IF NOT EXISTS idx_training_corpora_book_id ON training_corpora(book_id);
CREATE INDEX IF NOT EXISTS idx_training_corpora_version_id ON training_corpora(version_id);
CREATE INDEX IF NOT EXISTS idx_training_samples_corpus_id ON training_samples(corpus_id);

CREATE INDEX IF NOT EXISTS idx_dataset_lineage_book_id ON dataset_lineage(book_id);
CREATE INDEX IF NOT EXISTS idx_dataset_lineage_chapter_id ON dataset_lineage(chapter_id);
CREATE INDEX IF NOT EXISTS idx_dataset_lineage_scene_id ON dataset_lineage(scene_id);
CREATE INDEX IF NOT EXISTS idx_dataset_lineage_sample_id ON dataset_lineage(sample_id);
CREATE INDEX IF NOT EXISTS idx_dataset_lineage_dialogue_id ON dataset_lineage(dialogue_id);
CREATE INDEX IF NOT EXISTS idx_dataset_lineage_character_id ON dataset_lineage(character_id);
CREATE INDEX IF NOT EXISTS idx_dataset_lineage_emotion_id ON dataset_lineage(emotion_id);
CREATE INDEX IF NOT EXISTS idx_dataset_lineage_dataset_version_id ON dataset_lineage(dataset_version_id);
CREATE INDEX IF NOT EXISTS idx_dataset_lineage_corpus_version_id ON dataset_lineage(corpus_version_id);
