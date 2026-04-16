declare const __brand: unique symbol;
export type Brand<T, K> = T & { [__brand]: K };

export type ProductId = Brand<string, 'ProductId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ImageId = Brand<string, 'ImageId'>;
export type UserId = Brand<string, 'UserId'>;
export type UserRoleId = Brand<string, 'UserRoleId'>;

export type Ohm = Brand<number, 'Ohm'>;
export type Decibel = Brand<number, 'Decibel'>;
export type Hertz = Brand<number, 'Hertz'>;

export const toProductId = (id: string) => id as ProductId;
export const toCategoryId = (id: string) => id as CategoryId;
export const toImageId = (id: string) => id as ImageId;
export const toUserId = (id: string) => id as UserId;
export const toUserRoleId = (id: string) => id as UserRoleId;

export const toOhm = (val: number) => val as Ohm;
export const toDecibel = (val: number) => val as Decibel;
export const toHertz = (val: number) => val as Hertz;
