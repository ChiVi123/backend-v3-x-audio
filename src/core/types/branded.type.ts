// biome-ignore lint/style/useNamingConvention: for branded types
declare const __brand: unique symbol;
type Brand<T, K> = T & { [__brand]: K };

export type ProductId = Brand<string, 'ProductId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ImageId = Brand<string, 'ImageId'>;
export type UserId = Brand<string, 'UserId'>;
export type RoleId = Brand<string, 'RoleId'>;

export type Ohm = Brand<number, 'Ohm'>;
export type Decibel = Brand<number, 'Decibel'>;
export type Hertz = Brand<number, 'Hertz'>;
export type Usd = Brand<number, 'Usd'>;

export const toProductId = (id: string) => id as ProductId;
export const toCategoryId = (id: string) => id as CategoryId;
export const toImageId = (id: string) => id as ImageId;
export const toUserId = (id: string) => id as UserId;
export const toRoleId = (id: string) => id as RoleId;
export const toOhm = (val: number) => val as Ohm;
export const toDecibel = (val: number) => val as Decibel;
export const toHertz = (val: number) => val as Hertz;
export const toUsd = (val: number) => val as Usd;
