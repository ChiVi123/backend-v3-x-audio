import { validate } from '~/infrastructure/validations/env.validation';

const env = validate(process.env);
const baseFolder = `${env.CLOUDINARY_BASE_FOLDER}/${env.NODE_ENV}`;

export const CLOUDINARY_PRODUCT_FOLDER = `${baseFolder}/products`;
export const CLOUDINARY_USER_FOLDER = `${baseFolder}/users`;
export const CLOUDINARY_CATEGORY_FOLDER = `${baseFolder}/categories`;
