export type CondoDocumentType = 'document' | 'minute';

export interface CondoDocumentItem {
  name: string;
  displayName: string;
  date: string;
  size: number;
  updated: string;
}

export interface CondoDocumentSignedUrl {
  url: string;
  expiresInMinutes: number;
}

export interface UploadCondoDocumentRequest {
  file: File;
  type: CondoDocumentType;
  date?: string;
}

export interface UploadCondoDocumentResponse {
  name: string;
  displayName: string;
  type: CondoDocumentType;
  date: string;
}
