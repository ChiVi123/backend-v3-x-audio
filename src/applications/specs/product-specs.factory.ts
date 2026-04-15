import type {
  BaseSpecsDto,
  DacAmpSpecsDto,
  InEarSpecsDto,
  OverEarSpecsDto,
} from '~/applications/dtos/create-product.dto';
import {
  AudioCategory,
  type BaseAudioSpecs,
  type DacAmpSpecs,
  type InEarSpecs,
  type OverEarSpecs,
  type ProductSpecs,
} from '~/core/entities/product.entity';
import { toDecibel, toHertz, toOhm } from '~/core/types/branded.type';

type CreateSpecsFn = (dto: { specs: BaseSpecsDto | InEarSpecsDto | OverEarSpecsDto | DacAmpSpecsDto }) => ProductSpecs;

const createBaseSpecs = <Dto extends { specs: BaseSpecsDto }>(dto: Dto): BaseAudioSpecs => ({
  impedance: toOhm(dto.specs.impedance),
  sensitivity: toDecibel(dto.specs.sensitivity),
  frequencyResponse: {
    min: toHertz(dto.specs.frequencyResponse.min),
    max: toHertz(dto.specs.frequencyResponse.max),
  },
  driverType: dto.specs.driverType,
});

const createInEarSpecs = <Dto extends { specs: InEarSpecsDto }>(dto: Dto): InEarSpecs => ({
  ...createBaseSpecs(dto),
  type: AudioCategory.IN_EAR,
  fitType: dto.specs.fitType ?? 'universal',
  nozzleSize: dto.specs.nozzleSize,
});

const createOverEarSpecs = <Dto extends { specs: OverEarSpecsDto }>(dto: Dto): OverEarSpecs => ({
  ...createBaseSpecs(dto),
  type: AudioCategory.OVER_EAR,
  design: dto.specs.design,
  earpadMaterial: dto.specs.earpadMaterial,
});

const createDacAmpEarSpecs = <Dto extends { specs: DacAmpSpecsDto }>(dto: Dto): DacAmpSpecs => ({
  ...createBaseSpecs(dto),
  type: AudioCategory.DAC_AMP,
  chipset: dto.specs.chipset,
  maxSampleRate: dto.specs.maxSampleRate,
});

const specsCreatorMap = {
  [AudioCategory.IN_EAR]: createInEarSpecs,
  [AudioCategory.OVER_EAR]: createOverEarSpecs,
  [AudioCategory.DAC_AMP]: createDacAmpEarSpecs,
};

export const createProductSpecsFactory = (categorySlug: string): CreateSpecsFn => {
  return (specsCreatorMap[categorySlug as keyof typeof specsCreatorMap] ?? createBaseSpecs) as CreateSpecsFn;
};
