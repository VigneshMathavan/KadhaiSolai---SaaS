export type SceneId = string;

export interface Scene {
  id: SceneId;
  book_id: string;
  chapter_id: string;
  start_position: number;
  end_position: number;
  scene_type?: string;
  confidence_score?: number;
  created_at: Date;
}

export interface CreateSceneDTO {
  book_id: string;
  chapter_id: string;
  start_position: number;
  end_position: number;
  scene_type?: string;
  confidence_score?: number;
}
