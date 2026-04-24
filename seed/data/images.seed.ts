import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { imageTable } from '~/infrastructure/database/drizzle/schema';
import { IMG_01, IMG_02, IMG_03, IMG_04, IMG_05, IMG_06, IMG_07, IMG_08 } from '../constants';

export async function seedImages(db: NodePgDatabase) {
  await db.insert(imageTable).values([
    {
      id: IMG_01,
      url: 'https://placehold.co/800x800/1a1a2e/e0e0ff?text=Aria+Nova',
      alt: 'Moondrop Aria Nova – front view',
      remoteKey: 'products/aria-nova-main.webp',
      provider: 'cloudinary',
      metadata: { width: 800, height: 800, format: 'webp', bytes: 48200 },
      status: 'uploaded',
    },
    {
      id: IMG_02,
      url: 'https://placehold.co/800x800/1a1a2e/e0e0ff?text=Aria+Nova+Side',
      alt: 'Moondrop Aria Nova – side view',
      remoteKey: 'products/aria-nova-side.webp',
      provider: 'cloudinary',
      metadata: { width: 800, height: 800, format: 'webp', bytes: 41800 },
      status: 'uploaded',
    },
    {
      id: IMG_03,
      url: 'https://placehold.co/800x800/0d1b2a/8ecae6?text=Blessing+3',
      alt: 'Moondrop Blessing 3 – main view',
      remoteKey: 'products/blessing3-main.webp',
      provider: 'cloudinary',
      metadata: { width: 800, height: 800, format: 'webp', bytes: 55000 },
      status: 'uploaded',
    },
    {
      id: IMG_04,
      url: 'https://placehold.co/800x800/0d1b2a/8ecae6?text=Blessing+3+Side',
      alt: 'Moondrop Blessing 3 – cable view',
      remoteKey: 'products/blessing3-side.webp',
      provider: 'cloudinary',
      metadata: { width: 800, height: 800, format: 'webp', bytes: 49300 },
      status: 'uploaded',
    },
    {
      id: IMG_05,
      url: 'https://placehold.co/800x800/0f3460/e94560?text=Planar+X1',
      alt: 'Letshuoer S12 Pro – main view',
      remoteKey: 'products/planar-x1-main.webp',
      provider: 'cloudinary',
      metadata: { width: 800, height: 800, format: 'webp', bytes: 52100 },
      status: 'uploaded',
    },
    {
      id: IMG_06,
      url: 'https://placehold.co/800x800/0f3460/e94560?text=Planar+X1+Side',
      alt: 'Letshuoer S12 Pro – side view',
      remoteKey: 'products/planar-x1-side.webp',
      provider: 'cloudinary',
      metadata: { width: 800, height: 800, format: 'webp', bytes: 45600 },
      status: 'uploaded',
    },
    {
      id: IMG_07,
      url: 'https://placehold.co/800x800/2d2d2d/f5f5f5?text=Sundara+OB',
      alt: 'HIFIMAN Sundara – main view',
      remoteKey: 'products/sundara-ob-main.webp',
      provider: 'cloudinary',
      metadata: { width: 800, height: 800, format: 'webp', bytes: 61200 },
      status: 'uploaded',
    },
    {
      id: IMG_08,
      url: 'https://placehold.co/800x800/2d2d2d/f5f5f5?text=Sundara+OB+Side',
      alt: 'HIFIMAN Sundara – earcup detail',
      remoteKey: 'products/sundara-ob-side.webp',
      provider: 'cloudinary',
      metadata: { width: 800, height: 800, format: 'webp', bytes: 57800 },
      status: 'uploaded',
    },
  ]);
}
