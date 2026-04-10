import type { Readable } from 'node:stream';

export interface UploadMediaResponse {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export abstract class MediaService {
  abstract upload(file: Buffer | Readable, folder: string): Promise<UploadMediaResponse>;
  abstract delete(publicId: string): Promise<void>;
}
