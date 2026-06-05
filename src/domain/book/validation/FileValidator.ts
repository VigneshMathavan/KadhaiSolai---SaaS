import { CorruptedFileError, UnsupportedFormatError, InvalidEncodingError } from '@/core/errors/BookErrors';

export class FileValidator {
  static validate(buffer: Buffer, fileName: string, mimeType: string) {
    if (!buffer || buffer.length === 0) {
      throw new CorruptedFileError('File is empty or corrupted');
    }
    
    const validMimes = [
      'application/pdf', 
      'application/epub+zip', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain', 
      'text/markdown'
    ];
    
    if (!validMimes.includes(mimeType) && !fileName.match(/\.(pdf|epub|docx|txt|md)$/i)) {
      throw new UnsupportedFormatError(`Unsupported format: ${mimeType || fileName}`);
    }
    
    if (mimeType === 'text/plain' && buffer.includes(0x00)) {
      throw new InvalidEncodingError('Invalid text encoding, binary data detected in TXT file');
    }
  }
}
