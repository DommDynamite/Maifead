import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Collection, CreateCollectionInput, UpdateCollectionInput } from '@maifead/types';

interface CollectionStore {
  collections: Collection[];
  addCollection: (input: CreateCollectionInput) => Collection;
  updateCollection: (id: string, updates: UpdateCollectionInput) => void;
  deleteCollection: (id: string) => void;
  addItemToCollection: (collectionId: string, itemId: string) => void;
  removeItemFromCollection: (collectionId: string, itemId: string) => void;
  getCollectionsForItem: (itemId: string) => Collection[];
  isItemInCollection: (collectionId: string, itemId: string) => boolean;
  getCollectionItemCount: (collectionId: string) => number;
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collections: [],

      addCollection: input => {
        const newCollection: Collection = {
          id: crypto.randomUUID(),
          name: input.name,
          description: input.description,
          color: input.color || '#14b8a6', // Default to teal
          icon: input.icon || 'Folder',
          itemIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          collections: [...state.collections, newCollection],
        }));

        return newCollection;
      },

      updateCollection: (id, updates) => {
        set(state => ({
          collections: state.collections.map(collection =>
            collection.id === id
              ? {
                  ...collection,
                  ...updates,
                  updatedAt: new Date(),
                }
              : collection
          ),
        }));
      },

      deleteCollection: id => {
        set(state => ({
          collections: state.collections.filter(collection => collection.id !== id),
        }));
      },

      addItemToCollection: (collectionId, itemId) => {
        set(state => ({
          collections: state.collections.map(collection =>
            collection.id === collectionId && !collection.itemIds.includes(itemId)
              ? {
                  ...collection,
                  itemIds: [...collection.itemIds, itemId],
                  updatedAt: new Date(),
                }
              : collection
          ),
        }));
      },

      removeItemFromCollection: (collectionId, itemId) => {
        set(state => ({
          collections: state.collections.map(collection =>
            collection.id === collectionId
              ? {
                  ...collection,
                  itemIds: collection.itemIds.filter(id => id !== itemId),
                  updatedAt: new Date(),
                }
              : collection
          ),
        }));
      },

      getCollectionsForItem: itemId => {
        return get().collections.filter(collection => collection.itemIds.includes(itemId));
      },

      isItemInCollection: (collectionId, itemId) => {
        const collection = get().collections.find(c => c.id === collectionId);
        return collection ? collection.itemIds.includes(itemId) : false;
      },

      getCollectionItemCount: collectionId => {
        const collection = get().collections.find(c => c.id === collectionId);
        return collection ? collection.itemIds.length : 0;
      },
    }),
    {
      name: 'maifead-collections',
    }
  )
);
