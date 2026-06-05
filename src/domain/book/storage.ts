import { BookMetadata, BookSource } from './types';

export type BookStorageStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface PersistedBook {
  id: string;
  authorId: string;
  rawContentPath: string; // Path in storage bucket
  metadata: BookMetadata;
  source: BookSource;
  status: BookStorageStatus;
  ingestedAt: Date;
}

export interface BookPersistenceResult {
  success: boolean;
  book?: PersistedBook;
  error?: Error;
}
