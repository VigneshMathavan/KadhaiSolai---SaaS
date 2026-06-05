import { IBookRepository } from '@/domain/book/interfaces/IBookRepository';
import { PersistedBook, BookStorageStatus } from '@/domain/book/storage';
import { supabaseAdmin } from '@/lib/supabase';

export class BookRepository implements IBookRepository {
  async saveBook(book: PersistedBook): Promise<PersistedBook> {
    const admin = supabaseAdmin();
    const { data, error } = await admin.from('books').upsert({
      id: book.id,
      author_id: book.authorId,
      title: book.metadata.title,
      description: book.metadata.description,
      publisher: book.metadata.publisher,
      language: book.metadata.language,
      isbn: book.metadata.isbn,
      txt_path: book.rawContentPath,
      original_file_name: book.source.originalFileName,
      mime_type: book.source.mimeType,
      source_type: book.source.format,
      processing_status: book.status,
      ingested_at: book.ingestedAt.toISOString()
    }).select().single();
    
    if (error) throw new Error(error.message);
    return this.mapToDomain(data);
  }

  async getBookById(id: string): Promise<PersistedBook | null> {
    const { data, error } = await supabaseAdmin().from('books').select('*').eq('id', id).single();
    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async listBooks(): Promise<PersistedBook[]> {
    const { data, error } = await supabaseAdmin().from('books').select('*');
    if (error || !data) return [];
    return data.map((row: any) => this.mapToDomain(row));
  }

  async updateBookStatus(id: string, status: BookStorageStatus): Promise<void> {
    const { error } = await supabaseAdmin().from('books').update({ processing_status: status }).eq('id', id);
    if (error) throw new Error(error.message);
  }

  async deleteBook(id: string): Promise<void> {
    const { error } = await supabaseAdmin().from('books').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  private mapToDomain(row: any): PersistedBook {
    return {
      id: row.id,
      authorId: row.author_id,
      rawContentPath: row.txt_path,
      metadata: {
        title: row.title, 
        author: null, 
        description: row.description, 
        publisher: row.publisher, 
        language: row.language as any, 
        creationDate: null, 
        modifiedDate: null, 
        isbn: row.isbn
      },
      source: {
        originalFileName: row.original_file_name, 
        mimeType: row.mime_type, 
        fileSize: 0, 
        format: row.source_type as any
      },
      status: row.processing_status,
      ingestedAt: new Date(row.ingested_at)
    };
  }
}
