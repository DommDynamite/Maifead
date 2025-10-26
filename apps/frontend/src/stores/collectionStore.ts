import { create } from 'zustand';
import { api } from '../services/api';
import type { Collection, CreateCollectionInput, UpdateCollectionInput } from '@maifead/types';

interface CollectionStore {
  collections: Collection[];
  isLoading: boolean;
  fetchCollections: () => Promise<void>;
  addCollection: (input: CreateCollectionInput) => Promise<Collection>;
  updateCollection: (id: string, updates: UpdateCollectionInput) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addItemToCollection: (collectionId: string, itemId: string) => Promise<void>;
  removeItemFromCollection: (collectionId: string, itemId: string) => Promise<void>;
  getCollectionsForItem: (itemId: string) => Collection[];
  isItemInCollection: (collectionId: string, itemId: string) => boolean;
  getCollectionItemCount: (collectionId: string) => number;
}

export const useCollectionStore = create<CollectionStore>()((set, get) => ({
  collections: [],
  isLoading: false,

  fetchCollections: async () => {
    set({ isLoading: true });
    try {
      const collections = await api.getCollections();
      set({
        collections: collections.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          color: c.color,
          icon: c.icon,
          itemIds: [], // Will be populated when fetching individual collection
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        })),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      set({ isLoading: false });
    }
  },

  addCollection: async (input) => {
    try {
      const collection = await api.createCollection({
        name: input.name,
        color: input.color || '#14b8a6',
        icon: input.icon || 'Folder',
      });

      const newCollection: Collection = {
        id: collection.id,
        name: collection.name,
        description: input.description,
        color: collection.color,
        icon: collection.icon,
        itemIds: [],
        createdAt: new Date(collection.createdAt),
        updatedAt: new Date(collection.updatedAt),
      };

      set(state => ({
        collections: [...state.collections, newCollection],
      }));

      return newCollection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  },

  updateCollection: async (id, updates) => {
    try {
      const updated = await api.updateCollection(id, updates);
      set(state => ({
        collections: state.collections.map(collection =>
          collection.id === id
            ? {
                ...collection,
                name: updated.name,
                color: updated.color,
                icon: updated.icon,
                updatedAt: new Date(updated.updatedAt),
              }
            : collection
        ),
      }));
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  },

  deleteCollection: async (id) => {
    try {
      await api.deleteCollection(id);
      set(state => ({
        collections: state.collections.filter(collection => collection.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  },

  addItemToCollection: async (collectionId, itemId) => {
    try {
      await api.addItemToCollection(collectionId, itemId);
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
    } catch (error) {
      console.error('Failed to add item to collection:', error);
      throw error;
    }
  },

  removeItemFromCollection: async (collectionId, itemId) => {
    try {
      await api.removeItemFromCollection(collectionId, itemId);
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
    } catch (error) {
      console.error('Failed to remove item from collection:', error);
      throw error;
    }
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
}));
