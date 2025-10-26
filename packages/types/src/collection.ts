export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string; // Hex color for visual distinction
  icon?: string; // Icon name from lucide-react
  itemIds: string[]; // Array of ContentItem IDs
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCollectionInput = Pick<Collection, 'name' | 'description' | 'color' | 'icon'>;
export type UpdateCollectionInput = Partial<CreateCollectionInput>;
