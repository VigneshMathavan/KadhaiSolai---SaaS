import { BookParser } from '../interfaces/BookParser';
import { BookParserResult, BookSource, BookMetadata } from '../types';
import { FileValidator } from '../validation/FileValidator';
import { BookContentNormalizer } from '../normalization/BookContentNormalizer';
import { BookParsingError } from '@/core/errors/BookErrors';
import { TempFileManager } from '@/infrastructure/storage/TempFileManager';
// @ts-ignore
import EPub from 'epub2';

export class EpubBookParser implements BookParser {
  async parse(buffer: Buffer, fileName: string, mimeType: string): Promise<BookParserResult> {
    let tempPath: string | null = null;
    try {
      FileValidator.validate(buffer, fileName, mimeType);
      
      tempPath = await TempFileManager.createTempFile(buffer, fileName, 'epub');

      const epubData = await new Promise<any>((resolve, reject) => {
        const epub = new EPub(tempPath!, '/imagewebroot/', '/articlewebroot/');
        epub.on('end', async () => {
          try {
            let fullText = '';
            // Very basic sequential chapter extraction for phase 1.1
            for (const chapter of epub.flow) {
               if (chapter.id) {
                 const text: string = await new Promise((res, rej) => {
                   epub.getChapter(chapter.id as string, (err: Error | null, txt?: string) => {
                     if (err) res(''); else res(txt || '');
                   });
                 });
                 // Strip HTML tags roughly since epub returns html strings
                 fullText += text.replace(/<[^>]+>/g, ' ') + '\n\n';
               }
            }
            resolve({ metadata: epub.metadata, text: fullText });
          } catch (e) {
            reject(e);
          }
        });
        epub.on('error', (err: any) => reject(err));
        epub.parse();
      });

      const normalizedContent = BookContentNormalizer.normalize(epubData.text);
      
      const source: BookSource = { 
        originalFileName: fileName, 
        mimeType, 
        fileSize: buffer.length, 
        format: 'EPUB' 
      };
      
      const metadata: BookMetadata = { 
        title: epubData.metadata?.title || fileName.replace(/\.epub$/i, ''), 
        author: epubData.metadata?.creator || null, 
        description: epubData.metadata?.description || null, 
        publisher: epubData.metadata?.publisher || null, 
        language: epubData.metadata?.language || null, 
        creationDate: epubData.metadata?.date ? new Date(epubData.metadata.date) : null, 
        modifiedDate: null, 
        isbn: null 
      };

      return { success: true, book: { metadata, rawContent: normalizedContent, source } };

    } catch (error: any) {
      return { success: false, error: new BookParsingError(`EPUB parsing failed: ${error.message}`) };
    } finally {
      if (tempPath) {
        await TempFileManager.cleanupTempFile(tempPath);
      }
    }
  }
}
