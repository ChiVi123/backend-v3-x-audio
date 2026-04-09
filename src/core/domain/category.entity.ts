import type { CategoryId } from '~/core/types/branded.type';

/**
 * Category Entity - Dynamic product category.
 * Supports tree structure (Self-reference) via parentId.
 */
export interface Category {
  id: CategoryId;
  name: string;
  slug: string;

  /**
   * Points to the parent Category if it is a subcategory.
   * Is null for root categories.
   */
  parentId: CategoryId | null;

  description: string | null;

  /**
   * Metadata about time, normalized to JS Date type.
   */
  createdAt: Date;
  updatedAt: Date;
}
