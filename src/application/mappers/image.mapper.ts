import type { ImageEntity } from '~/domain/entities/image.entity';
import type { ImageStatus } from '~/domain/enums/image.enum';
import { toImageId } from '~/domain/types/branded.type';

export const ImageMapper = {
  // biome-ignore lint/suspicious/noExplicitAny: Raw database results are often complex to type precisely without excessive boilerplate
  toDomain: (raw: any): ImageEntity => ({
    id: toImageId(raw.id),
    url: raw.url,
    alt: raw.alt,
    remoteKey: raw.remoteKey ?? undefined,
    provider: raw.provider ?? undefined,
    metadata: raw.metadata ?? undefined,
    status: raw.status as ImageStatus,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? undefined,
  }),
} as const;
