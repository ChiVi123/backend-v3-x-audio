import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { productImageTable } from '~/infrastructure/database/drizzle/schema';
import {
  IMG_01,
  IMG_02,
  IMG_03,
  IMG_04,
  IMG_05,
  IMG_06,
  IMG_07,
  IMG_08,
  PROD_01,
  PROD_02,
  PROD_03,
  PROD_04,
} from '../constants';

export async function seedProductImages(db: NodePgDatabase) {
  await db.insert(productImageTable).values([
    { productId: PROD_01, imageId: IMG_01, isPrimary: true },
    { productId: PROD_01, imageId: IMG_02, isPrimary: false },
    { productId: PROD_02, imageId: IMG_03, isPrimary: true },
    { productId: PROD_02, imageId: IMG_04, isPrimary: false },
    { productId: PROD_03, imageId: IMG_05, isPrimary: true },
    { productId: PROD_03, imageId: IMG_06, isPrimary: false },
    { productId: PROD_04, imageId: IMG_07, isPrimary: true },
    { productId: PROD_04, imageId: IMG_08, isPrimary: false },
  ]);
}
