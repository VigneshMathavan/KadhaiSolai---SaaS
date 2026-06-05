import { BookParser } from './interfaces/BookParser';
import { PdfBookParser } from './parsers/PdfBookParser';
import { TxtBookParser } from './parsers/TxtBookParser';
import { DocxBookParser } from './parsers/DocxBookParser';
import { EpubBookParser } from './parsers/EpubBookParser';
import { UnsupportedFormatError } from '@/core/errors/BookErrors';

export class BookParserFactory {
  static getParser(fileName: string, mimeType: string): BookParser {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (mimeType === 'application/pdf' || ext === 'pdf') {
      return new PdfBookParser();
    }
    
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') {
      return new DocxBookParser();
    }
    
    if (mimeType === 'application/epub+zip' || ext === 'epub') {
      return new EpubBookParser();
    }
    
    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || ext === 'txt' || ext === 'md') {
      return new TxtBookParser();
    }
    
    throw new UnsupportedFormatError(`No parser available for format: ${ext || mimeType}`);
  }
}
