import type { BaseEntity } from '~/domain/entities/base.entity';
import type { DriverType, ProductStatus } from '~/domain/enums/product.enum';
import type { CategoryId, Decibel, Hertz, Ohm, ProductId } from '~/domain/types/branded.type';

/**
 * Product Entity
 * @property id - Product ID
 * @property name - Product name
 * @property slug - Product slug
 * @property categoryId - Product category ID
 * @property description - Product description
 * @property price - Product price
 * @property stock - Product stock
 * @property specs - Product specs
 * @property frGraphData - Product FR graph data
 * @property threeModelId - Product 3D model ID
 * @property aiGenerated - Whether product is AI generated
 * @property status - Product status
 */
export interface ProductEntity extends BaseEntity<ProductId> {
  name: string;
  slug: string;
  categoryId: CategoryId;
  description: string;
  price: number;
  stock: number;
  specs: ProductSpecs;
  frGraphData: [number, number][]; // Coordinate of FR Graph
  threeModelId?: string;
  aiGenerated?: boolean;
  status: ProductStatus;
}

export type ProductSpecs = {
  impedance: Ohm;
  sensitivity: Decibel;
  frequencyResponse: {
    min: Hertz;
    max: Hertz;
  };
  driverType: DriverType;
} & Record<string, unknown>;
