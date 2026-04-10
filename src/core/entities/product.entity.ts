import type { Image } from '~/core/entities/image.entity';
import type { CategoryId, Decibel, Hertz, Ohm, ProductId, Usd } from '~/core/types/branded.type';
import type { DriverType } from '~/core/types/product.type';

export interface ProductSpecs {
  impedance: Ohm;
  sensitivity: Decibel;
  frequencyResponse: {
    min: Hertz;
    max: Hertz;
  };
  driverType: DriverType;
}

export interface Product {
  id: ProductId;
  name: string;
  slug: string;
  categoryId: CategoryId;
  description: string;
  price: Usd;
  stock: number;
  specs: ProductSpecs;
  frGraphData: [number, number][]; // Coordinates [x, y] for D3.js
  threeModelId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithArrayImage extends Product {
  images: Image[];
}

export interface ProductWithSingleImage extends Product {
  image: Image;
}
