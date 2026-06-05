export interface NormalizerConfig {
  removeExtraWhitespace?: boolean;
  normalizeNewlines?: boolean;
  removeInvalidChars?: boolean;
}

export class BookContentNormalizer {
  static normalize(text: string, config: NormalizerConfig = { removeExtraWhitespace: true, normalizeNewlines: true, removeInvalidChars: true }): string {
    let result = text;
    // Normalization preserves Tamil unicode block (\u0B80-\u0BFF) implicitly
    if (config.normalizeNewlines) {
      result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    if (config.removeExtraWhitespace) {
      result = result.replace(/[ \t]+/g, ' ');
    }
    if (config.removeInvalidChars) {
      // Remove strict control characters but keep text safe
      result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    }
    return result.trim();
  }
}
