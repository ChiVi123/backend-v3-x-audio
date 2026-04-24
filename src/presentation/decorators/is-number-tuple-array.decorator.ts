import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNumberTupleArray', async: false })
export class IsNumberTupleArrayConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (!Array.isArray(value)) return false;

    return value.every((item) => {
      return Array.isArray(item) && item.length === 2 && typeof item[0] === 'number' && typeof item[1] === 'number';
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be an array of [number, number] tuples (e.g., [[1, 2], [3, 4]])`;
  }
}

export function IsNumberTupleArray(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNumberTupleArrayConstraint,
    });
  };
}
