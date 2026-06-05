import { ISceneRepository } from '../interfaces/ISceneRepository';
import { Scene, CreateSceneDTO, SceneId } from '../types';

export class ScenePersistenceService {
  constructor(private readonly repository: ISceneRepository) {}

  async createScene(dto: CreateSceneDTO): Promise<Scene> {
    if (dto.end_position <= dto.start_position) {
      throw new Error("Invalid scene boundaries: end_position must be greater than start_position.");
    }
    return await this.repository.create(dto);
  }

  async createScenesBatch(dtos: CreateSceneDTO[]): Promise<Scene[]> {
    for (const dto of dtos) {
      if (dto.end_position <= dto.start_position) {
        throw new Error("Invalid scene boundaries found in batch.");
      }
    }
    return await this.repository.createMany(dtos);
  }

  async getScenesForChapter(chapterId: string): Promise<Scene[]> {
    return await this.repository.findByChapter(chapterId);
  }
}
