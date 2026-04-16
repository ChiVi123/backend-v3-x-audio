export interface MediaService<Response> {
  upload(file: Buffer): Promise<Response>;
  delete(key: string): Promise<void>;
}
