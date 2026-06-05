import { PersistedBook, BookStorageStatus } from '../storage';

export interface IBookRepository {
  saveBook(book: PersistedBook): Promise<PersistedBook>;
  getBookById(id: string): Promise<PersistedBook | null>;
  listBooks(): Promise<PersistedBook[]>;
  updateBookStatus(id: string, status: BookStorageStatus): Promise<void>;
  deleteBook(id: string): Promise<void>;
}
