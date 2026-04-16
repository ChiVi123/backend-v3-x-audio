import { toCategoryId, toImageId, toProductId } from '~/domain/types/branded.type';

// ---------------------------------------------------------------------------
// UUIDs (static so the seed is re-runnable / idempotent)
// ---------------------------------------------------------------------------

// Categories
export const CAT_IEM = toCategoryId('11111111-0000-0000-0000-000000000001');
export const CAT_HEADPHONE = toCategoryId('11111111-0000-0000-0000-000000000002');
export const CAT_EARPHONE = toCategoryId('11111111-0000-0000-0000-000000000003');

// Sub-categories
export const CAT_IEM_DYNAMIC = toCategoryId('11111111-0000-0000-0000-000000000011');
export const CAT_IEM_PLANAR = toCategoryId('11111111-0000-0000-0000-000000000012');
export const CAT_HEADPHONE_OPEN = toCategoryId('11111111-0000-0000-0000-000000000013');
export const CAT_HEADPHONE_CLOSED = toCategoryId('11111111-0000-0000-0000-000000000014');

// Images
export const IMG_01 = toImageId('22222222-0000-0000-0000-000000000001');
export const IMG_02 = toImageId('22222222-0000-0000-0000-000000000002');
export const IMG_03 = toImageId('22222222-0000-0000-0000-000000000003');
export const IMG_04 = toImageId('22222222-0000-0000-0000-000000000004');
export const IMG_05 = toImageId('22222222-0000-0000-0000-000000000005');
export const IMG_06 = toImageId('22222222-0000-0000-0000-000000000006');
export const IMG_07 = toImageId('22222222-0000-0000-0000-000000000007');
export const IMG_08 = toImageId('22222222-0000-0000-0000-000000000008');

// Products
export const PROD_01 = toProductId('33333333-0000-0000-0000-000000000001');
export const PROD_02 = toProductId('33333333-0000-0000-0000-000000000002');
export const PROD_03 = toProductId('33333333-0000-0000-0000-000000000003');
export const PROD_04 = toProductId('33333333-0000-0000-0000-000000000004');
