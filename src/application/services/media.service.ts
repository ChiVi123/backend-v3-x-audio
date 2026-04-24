import type { FileUpload } from '~/application/types/media.type';

export interface MediaService<Response> {
  upload(file: FileUpload): Promise<Response>;
  uploadMultiple(files: FileUpload[]): Promise<PromiseSettledResult<Response>[]>;
  delete(key: string): Promise<void>;
  deleteMultiple(keys: string[]): Promise<void>;
}
