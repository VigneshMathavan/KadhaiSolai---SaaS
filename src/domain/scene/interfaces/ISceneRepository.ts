import { Scene, CreateSceneDTO, SceneId } from './types';

export interface ISceneRepository {
  findById(id: SceneId): Promise<Scene | null>;
  findByChapter(chapterId: string): Promise<Scene[]>;
  findByBook(bookId: string): Promise<Scene[]>;
  create(scene: CreateSceneDTO): Promise<Scene>;
  createMany(scenes: CreateSceneDTO[]): Promise<Scene[]>;
  delete(id: SceneId): Promise<boolean>;
  deleteByBook(bookId: string): Promise<boolean>;
}
