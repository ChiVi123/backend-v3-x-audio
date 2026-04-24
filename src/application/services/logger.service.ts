/** biome-ignore-all lint/suspicious/noExplicitAny: false positive */
export interface LoggerService {
  log(message: any, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: any[]): void;
}
