import type { FileUpload } from '~/application/types/media.type';

export interface MediaService<Response> {
  upload(file: FileUpload): Promise<Response>;
  delete(key: string): Promise<void>;
}
