import { SupabaseClient } from '@supabase/supabase-js';
import { ISceneRepository } from '../../domain/scene/interfaces/ISceneRepository';
import { Scene, CreateSceneDTO, SceneId } from '../../domain/scene/types';

export class SceneRepository implements ISceneRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: SceneId): Promise<Scene | null> {
    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Scene fetch failed: ${error.message}`);
    return data as Scene | null;
  }

  async findByChapter(chapterId: string): Promise<Scene[]> {
    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('start_position', { ascending: true });

    if (error) throw new Error(`Scenes fetch by chapter failed: ${error.message}`);
    return data as Scene[];
  }

  async findByBook(bookId: string): Promise<Scene[]> {
    const { data, error } = await this.supabase
      .from('scenes')
      .select('*')
      .eq('book_id', bookId)
      .order('start_position', { ascending: true });

    if (error) throw new Error(`Scenes fetch by book failed: ${error.message}`);
    return data as Scene[];
  }

  async create(scene: CreateSceneDTO): Promise<Scene> {
    const { data, error } = await this.supabase
      .from('scenes')
      .insert([scene])
      .select()
      .single();

    if (error) throw new Error(`Scene creation failed: ${error.message}`);
    return data as Scene;
  }

  async createMany(scenes: CreateSceneDTO[]): Promise<Scene[]> {
    const { data, error } = await this.supabase
      .from('scenes')
      .insert(scenes)
      .select();

    if (error) throw new Error(`Scene bulk creation failed: ${error.message}`);
    return data as Scene[];
  }

  async delete(id: SceneId): Promise<boolean> {
    const { error } = await this.supabase
      .from('scenes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Scene deletion failed: ${error.message}`);
    return true;
  }

  async deleteByBook(bookId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('scenes')
      .delete()
      .eq('book_id', bookId);

    if (error) throw new Error(`Scenes deletion by book failed: ${error.message}`);
    return true;
  }
}
