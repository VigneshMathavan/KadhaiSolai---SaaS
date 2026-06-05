import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomBytes } from 'crypto';

export class TempFileManager {
  static async verifyTempStorage(): Promise<boolean> {
    try {
      const tmp = os.tmpdir();
      await fs.access(tmp, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  static safeFileName(originalName: string, ext: string): string {
    const clean = originalName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const hash = randomBytes(4).toString('hex');
    return `${clean}_${hash}.${ext}`;
  }

  static async createTempFile(buffer: Buffer, originalName: string, ext: string): Promise<string> {
    const tmp = os.tmpdir();
    const fileName = this.safeFileName(originalName, ext);
    const fullPath = path.join(tmp, fileName);
    
    await fs.writeFile(fullPath, buffer);
    return fullPath;
  }

  static async cleanupTempFile(fullPath: string): Promise<void> {
    try {
      await fs.unlink(fullPath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.error(JSON.stringify({
          traceId: 'SYSTEM',
          error: 'TempFileCleanupFailed',
          path: fullPath,
          message: err.message
        }));
      }
    }
  }

  static async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (file.includes('.epub') || file.includes('.pdf') || file.includes('.tmp')) {
           const fullPath = path.join(dirPath, file);
           const stat = await fs.stat(fullPath);
           // Cleanup files older than 1 hour (orphaned worker files)
           if (Date.now() - stat.mtimeMs > 3600000) {
             await fs.unlink(fullPath).catch(() => {});
           }
        }
      }
    } catch (err: any) {
      console.error('Failed to cleanup temp directory', err);
    }
  }
}
