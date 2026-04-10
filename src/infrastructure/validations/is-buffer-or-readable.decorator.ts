import { Readable } from 'node:stream';
import { registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator';

export function IsBufferOrReadable(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isBufferOrReadable',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: Buffer | Readable, _args: ValidationArguments) {
          return Buffer.isBuffer(value) || value instanceof Readable;
        },
        defaultMessage(_args: ValidationArguments) {
          return `${propertyName} must be either a Buffer or a Readable stream`;
        },
      },
    });
  };
}
