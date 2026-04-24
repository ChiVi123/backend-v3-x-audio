import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DriverType, ProductStatus } from '~/domain/enums/product.enum';
import { toDecibel, toHertz, toOhm } from '~/domain/types/branded.type';
import { productTable } from '~/infrastructure/database/drizzle/schema';
import { CAT_HEADPHONE_OPEN, CAT_IEM_DYNAMIC, CAT_IEM_PLANAR, PROD_01, PROD_02, PROD_03, PROD_04 } from '../constants';
import { generateFrGraph } from '../utils';

export async function seedProducts(db: NodePgDatabase) {
  await db.insert(productTable).values([
    {
      id: PROD_01,
      name: 'Aria Nova',
      slug: 'aria-nova',
      categoryId: CAT_IEM_DYNAMIC,
      description:
        'The Aria Nova is a refined single dynamic driver IEM featuring a 10 mm liquid-crystal polymer cone.',
      price: 7900,
      stock: 120,
      status: ProductStatus.PUBLISHED,
      aiGenerated: false,
      specs: {
        impedance: toOhm(32),
        sensitivity: toDecibel(122),
        frequencyResponse: { min: toHertz(5), max: toHertz(35000) },
        driverType: DriverType.DYNAMIC,
        driverCount: 1,
        driverConfiguration: '1DD',
        connectorType: '0.78mm 2-Pin',
        cableLength: 1.2,
        weight: 7.8,
      },
      frGraphData: generateFrGraph(1000, 94, 4),
    },
    {
      id: PROD_02,
      name: 'Blessing 3',
      slug: 'blessing-3',
      categoryId: CAT_IEM_DYNAMIC,
      description:
        'The Blessing 3 is a flagship hybrid in-ear monitor combining one dynamic driver with four balanced armature drivers.',
      price: 32000,
      stock: 45,
      status: ProductStatus.PUBLISHED,
      aiGenerated: false,
      specs: {
        impedance: toOhm(22),
        sensitivity: toDecibel(117),
        frequencyResponse: { min: toHertz(10), max: toHertz(40000) },
        driverType: DriverType.DYNAMIC,
        driverCount: 5,
        driverConfiguration: '1DD + 4BA',
        connectorType: '0.78mm 2-Pin',
        cableLength: 1.2,
        weight: 8.9,
        crossoverType: '3-way passive',
      },
      frGraphData: generateFrGraph(2000, 95, 2),
    },
    {
      id: PROD_03,
      name: 'Planar X1',
      slug: 'planar-x1',
      categoryId: CAT_IEM_PLANAR,
      description:
        'The Planar X1 is a 14.8 mm planar magnetic in-ear monitor delivering outstanding transient response.',
      price: 22000,
      stock: 60,
      status: ProductStatus.PUBLISHED,
      aiGenerated: false,
      specs: {
        impedance: toOhm(14.8),
        sensitivity: toDecibel(102),
        frequencyResponse: { min: toHertz(20), max: toHertz(40000) },
        driverType: DriverType.PLANAR,
        driverCount: 1,
        driverConfiguration: '1 Planar Magnetic',
        connectorType: '0.78mm 2-Pin',
        diaphragmSize: '14.8mm',
        cableLength: 1.2,
        weight: 10.2,
        thd: '<0.1% @ 94dB',
      },
      frGraphData: generateFrGraph(3000, 96, 1),
    },
    {
      id: PROD_04,
      name: 'Sundara OB',
      slug: 'sundara-ob',
      categoryId: CAT_HEADPHONE_OPEN,
      description: 'The Sundara OB is an open-back planar magnetic headphone that redefines high-fidelity audio.',
      price: 35000,
      stock: 30,
      status: ProductStatus.PUBLISHED,
      aiGenerated: false,
      specs: {
        impedance: toOhm(37),
        sensitivity: toDecibel(94),
        frequencyResponse: { min: toHertz(6), max: toHertz(75000) },
        driverType: DriverType.PLANAR,
        driverCount: 2,
        driverConfiguration: '2 Planar Magnetic (L+R)',
        connectorType: '3.5mm + 6.3mm adapter',
        cableLength: 1.5,
        weight: 372,
        designType: 'Open-Back',
        earcupMaterial: 'Protein leather + velour',
      },
      frGraphData: generateFrGraph(1500, 94, 3),
    },
  ]);
}
