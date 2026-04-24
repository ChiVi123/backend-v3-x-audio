import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { categoryTable } from '~/infrastructure/database/drizzle/schema';
import {
  CAT_EARPHONE,
  CAT_HEADPHONE,
  CAT_HEADPHONE_CLOSED,
  CAT_HEADPHONE_OPEN,
  CAT_IEM,
  CAT_IEM_DYNAMIC,
  CAT_IEM_PLANAR,
} from '../constants';

export async function seedCategories(db: NodePgDatabase) {
  await db.insert(categoryTable).values([
    {
      id: CAT_IEM,
      name: 'In-Ear Monitor',
      slug: 'in-ear-monitor',
      description:
        'Professional in-ear monitors designed for audiophiles and musicians who demand accurate sound reproduction.',
      productCount: 0,
    },
    {
      id: CAT_HEADPHONE,
      name: 'Headphone',
      slug: 'headphone',
      description: 'Full-size over-ear and on-ear headphones for immersive listening experiences.',
      productCount: 0,
    },
    {
      id: CAT_EARPHONE,
      name: 'Earphone',
      slug: 'earphone',
      description: 'Compact earphones for everyday listening with a balance of comfort and quality.',
      productCount: 0,
    },
    {
      id: CAT_IEM_DYNAMIC,
      name: 'IEM – Dynamic Driver',
      slug: 'iem-dynamic-driver',
      description: 'In-ear monitors powered by dynamic (moving-coil) drivers known for their natural bass response.',
      parentId: CAT_IEM,
      productCount: 0,
    },
    {
      id: CAT_IEM_PLANAR,
      name: 'IEM – Planar Magnetic',
      slug: 'iem-planar-magnetic',
      description:
        'In-ear monitors with planar magnetic drivers offering exceptional detail retrieval and low distortion.',
      parentId: CAT_IEM,
      productCount: 0,
    },
    {
      id: CAT_HEADPHONE_OPEN,
      name: 'Headphone – Open-Back',
      slug: 'headphone-open-back',
      description: 'Open-back headphones with a wide, natural soundstage ideal for home listening.',
      parentId: CAT_HEADPHONE,
      productCount: 0,
    },
    {
      id: CAT_HEADPHONE_CLOSED,
      name: 'Headphone – Closed-Back',
      slug: 'headphone-closed-back',
      description: 'Closed-back headphones with passive noise isolation, great for studio and travel use.',
      parentId: CAT_HEADPHONE,
      productCount: 0,
    },
  ]);
}
