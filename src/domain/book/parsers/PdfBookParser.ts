import { BookParser } from '../interfaces/BookParser';
import { BookParserResult, BookSource, BookMetadata } from '../types';
import { FileValidator } from '../validation/FileValidator';
import { BookContentNormalizer } from '../normalization/BookContentNormalizer';
import { BookParsingError } from '@/core/errors/BookErrors';
// @ts-ignore
import pdf from 'pdf-parse';

export class PdfBookParser implements BookParser {
  async parse(buffer: Buffer, fileName: string, mimeType: string): Promise<BookParserResult> {
    try {
      FileValidator.validate(buffer, fileName, mimeType);
      const data = await pdf(buffer);
      const normalizedContent = BookContentNormalizer.normalize(data.text);
      
      const source: BookSource = { 
        originalFileName: fileName, 
        mimeType, 
        fileSize: buffer.length, 
        format: 'PDF' 
      };
      
      const metadata: BookMetadata = { 
        title: data.info?.Title || fileName.replace(/\.pdf$/i, ''), 
        author: data.info?.Author || null, 
        description: data.info?.Subject || null, 
        publisher: null, 
        language: null, 
        creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : null, 
        modifiedDate: data.info?.ModDate ? new Date(data.info.ModDate) : null, 
        isbn: null 
      };
      
      return { success: true, book: { metadata, rawContent: normalizedContent, source } };
    } catch (error: any) {
      return { success: false, error: new BookParsingError(`PDF parsing failed: ${error.message}`) };
    }
  }
}
