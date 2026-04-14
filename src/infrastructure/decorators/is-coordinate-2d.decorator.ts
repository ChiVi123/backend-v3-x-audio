import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCoordinate2D', async: false })
export class IsCoordinate2DConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number';
  }

  defaultMessage() {
    return 'Each element must be a pair of [number, number]';
  }
}

export function IsCoordinate2D(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCoordinate2DConstraint,
    });
  };
}
