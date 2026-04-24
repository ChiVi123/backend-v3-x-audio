export const CATEGORY_COLUMNS = {
  id: true,
  name: true,
  slug: true,
  description: true,
  parentId: true,
  productCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const IMAGE_COLUMNS = {
  id: true,
  url: true,
  alt: true,
  remoteKey: true,
  provider: true,
  metadata: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const PRODUCT_COLUMNS = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  stock: true,
  specs: true,
  frGraphData: true,
  threeModelId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;
