import { type ClassConstructor, plainToInstance, Transform } from 'class-transformer';

/**
 * A custom decorator that automatically parses a JSON string into an object or array.
 * If a target class is provided, it will also convert the result into an instance of that class.
 * Useful for handling complex fields sent via multipart/form-data with ValidationPipe whitelist.
 */

// biome-ignore lint/suspicious/noExplicitAny: Any class
export function JsonTransform(targetClass?: ClassConstructor<any>) {
  return Transform(({ value }) => {
    // 1. Parse JSON if it's a string
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch (_error) {
        return value;
      }
    }

    // 2. Convert to class instance if targetClass is provided and parsed is an object/array
    if (targetClass && parsed && typeof parsed === 'object') {
      return plainToInstance(targetClass, parsed);
    }

    return parsed;
  });
}
