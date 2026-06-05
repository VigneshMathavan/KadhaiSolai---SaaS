import { BookParserResult } from '../types';

export interface BookParser {
  parse(buffer: Buffer, fileName: string, mimeType: string): Promise<BookParserResult>;
}
