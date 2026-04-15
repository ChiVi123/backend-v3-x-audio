import type { Image } from '~/core/entities/image.entity';
import type { CategoryId, Decibel, Hertz, Ohm, ProductId, Usd } from '~/core/types/branded.type';
import type { DriverType } from '~/core/types/product.type';

export enum AudioCategory {
  IN_EAR = 'in-ear',
  OVER_EAR = 'over-ear',
  DAC_AMP = 'dac-amp',
  SPEAKER = 'speaker',
}

export interface BaseAudioSpecs {
  impedance: Ohm;
  sensitivity: Decibel;
  frequencyResponse: {
    min: Hertz;
    max: Hertz;
  };
  driverType: DriverType;
}

export interface InEarSpecs extends BaseAudioSpecs {
  type: AudioCategory.IN_EAR;
  fitType: 'universal' | 'custom';
  nozzleSize?: number; // mm
}

export interface OverEarSpecs extends BaseAudioSpecs {
  type: AudioCategory.OVER_EAR;
  design: 'open-back' | 'closed-back' | 'semi-open';
  earpadMaterial: string;
}

export interface DacAmpSpecs extends BaseAudioSpecs {
  type: AudioCategory.DAC_AMP;
  chipset: string;
  maxSampleRate: string; // e.g. "32-bit/768kHz"
}

export type ProductSpecs = BaseAudioSpecs | InEarSpecs | OverEarSpecs | DacAmpSpecs;

export enum ProductStatus {
  DRAFT = 'draft',
  LIVE = 'live',
  ARCHIVED = 'archived',
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
  status: ProductStatus;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithArrayImage extends Product {
  images: Image[];
}

export interface ProductWithSingleImage extends Product {
  image: Image;
}
