import { IBookRepository } from '../interfaces/IBookRepository';
import { ParsedBook } from '../types';
import { PersistedBook, BookPersistenceResult } from '../storage';
import { supabaseAdmin } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export class BookPersistenceService {
  constructor(private readonly repository: IBookRepository) {}

  async persistParsedBook(parsed: ParsedBook, authorId: string, traceId: string, parserName: string): Promise<BookPersistenceResult> {
    const startTime = Date.now();
    try {
      const bookId = randomUUID();
      const txtPath = `ingested/${bookId}.txt`;
      
      const admin = supabaseAdmin();
      const { error: uploadErr } = await admin.storage
        .from('books-txt')
        .upload(txtPath, parsed.rawContent, { contentType: 'text/plain', upsert: true });
        
      if (uploadErr) throw uploadErr;

      const persisted: PersistedBook = {
        id: bookId,
        authorId,
        rawContentPath: txtPath,
        metadata: parsed.metadata,
        source: parsed.source,
        status: 'pending',
        ingestedAt: new Date()
      };

      const saved = await this.repository.saveBook(persisted);

      // Audit Trail Implementation
      this.logAudit({
        traceId, bookId, parserName, 
        sourceFile: parsed.source.originalFileName, 
        mimeType: parsed.source.mimeType, 
        language: parsed.metadata.language || 'Unknown', 
        processingTime: Date.now() - startTime, 
        status: 'SUCCESS'
      });

      return { success: true, book: saved };

    } catch (error: any) {
      this.logAudit({
        traceId, bookId: 'UNKNOWN', parserName, 
        sourceFile: parsed.source.originalFileName, 
        mimeType: parsed.source.mimeType, 
        language: parsed.metadata.language || 'Unknown', 
        processingTime: Date.now() - startTime, 
        status: 'FAILED',
        error: error.message
      });
      return { success: false, error };
    }
  }

  async getBookById(id: string) { return this.repository.getBookById(id); }
  async getBookMetadata(id: string) { const b = await this.getBookById(id); return b?.metadata || null; }
  async getBookSource(id: string) { const b = await this.getBookById(id); return b?.source || null; }
  async listBooks() { return this.repository.listBooks(); }
  async updateBookStatus(id: string, status: any) { return this.repository.updateBookStatus(id, status); }
  async deleteBook(id: string) { return this.repository.deleteBook(id); }

  private logAudit(payload: Record<string, any>) {
    // Structured JSON log for the Phase 0 Logging Framework requirement
    console.log(JSON.stringify({ event: 'BookIngestionAudit', ...payload }));
  }
}
