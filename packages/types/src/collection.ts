export interface Collection {
  id: string;
  userId: string; // Owner of the collection
  name: string;
  description?: string;
  color?: string; // Hex color for visual distinction
  icon?: string; // Icon name from lucide-react
  isPublic: boolean; // Whether collection is publicly discoverable
  itemIds: string[]; // Array of ContentItem IDs
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCollectionInput = Pick<Collection, 'name' | 'description' | 'color' | 'icon'> & {
  isPublic?: boolean;
};
export type UpdateCollectionInput = Partial<Omit<CreateCollectionInput, 'name'> & { name?: string }>;

// Public collection with user information for discovery
export interface PublicCollectionWithUser extends Collection {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  itemCount: number;
}
