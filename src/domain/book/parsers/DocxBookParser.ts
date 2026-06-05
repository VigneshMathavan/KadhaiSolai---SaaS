import { BookParser } from '../interfaces/BookParser';
import { BookParserResult, BookSource, BookMetadata } from '../types';
import { FileValidator } from '../validation/FileValidator';
import { BookContentNormalizer } from '../normalization/BookContentNormalizer';
import { BookParsingError } from '@/core/errors/BookErrors';
// @ts-ignore
import mammoth from 'mammoth';

export class DocxBookParser implements BookParser {
  async parse(buffer: Buffer, fileName: string, mimeType: string): Promise<BookParserResult> {
    try {
      FileValidator.validate(buffer, fileName, mimeType);
      const result = await mammoth.extractRawText({ buffer });
      const normalizedContent = BookContentNormalizer.normalize(result.value);
      
      const source: BookSource = { 
        originalFileName: fileName, 
        mimeType, 
        fileSize: buffer.length, 
        format: 'DOCX' 
      };
      
      const metadata: BookMetadata = { 
        title: fileName.replace(/\.docx$/i, ''), 
        author: null, description: null, publisher: null, 
        language: null, creationDate: null, modifiedDate: null, isbn: null 
      };
      
      return { success: true, book: { metadata, rawContent: normalizedContent, source } };
    } catch (error: any) {
      return { success: false, error: new BookParsingError(`DOCX parsing failed: ${error.message}`) };
    }
  }
}
