import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUrl, Matches, Max, Min, validateSync } from 'class-validator';
import type { StringValue } from 'ms';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

// Regex to validate `ms` library string formats (e.g., '15m', '7d', '1.5 hours')
const MS_STRING_FORMAT_REGEX = /^-?\d+(\.\d+)? ?(ms|s|m|h|d|w|y|secs?|mins?|hours?|days?|weeks?|years?)?$/i;

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsUrl({ protocols: ['postgres', 'postgresql', 'mysql', 'mongodb'], require_tld: false })
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_SECRET: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_BASE_FOLDER: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @Matches(MS_STRING_FORMAT_REGEX, { message: 'JWT_ACCESS_EXPIRES_IN must be a valid time string (e.g. 15m, 1h, 7d)' })
  JWT_ACCESS_EXPIRES_IN: StringValue;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @Matches(MS_STRING_FORMAT_REGEX, { message: 'JWT_REFRESH_EXPIRES_IN must be a valid time string (e.g. 15m, 1h, 7d)' })
  JWT_REFRESH_EXPIRES_IN: StringValue;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
