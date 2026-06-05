export class BaseDomainError extends Error {
  constructor(msg: string) { super(msg); }
}

export class BookParsingError extends BaseDomainError {
  constructor(msg: string) { super(msg); this.name = 'BookParsingError'; }
}
export class UnsupportedFormatError extends BaseDomainError {
  constructor(msg: string) { super(msg); this.name = 'UnsupportedFormatError'; }
}
export class CorruptedFileError extends BaseDomainError {
  constructor(msg: string) { super(msg); this.name = 'CorruptedFileError'; }
}
export class InvalidEncodingError extends BaseDomainError {
  constructor(msg: string) { super(msg); this.name = 'InvalidEncodingError'; }
}
export class MetadataExtractionError extends BaseDomainError {
  constructor(msg: string) { super(msg); this.name = 'MetadataExtractionError'; }
}
