/**
 * Fead = Feed + Preset
 * A custom collection of sources that users can quickly switch between
 */

export interface Fead {
  id: string;
  name: string;
  icon: string; // Emoji or icon identifier
  sourceIds: string[]; // Array of FeedSource IDs (UUIDs from backend)
  isImportant?: boolean; // Mark this Fead as important for notifications
  createdAt: Date;
  updatedAt: Date;
}

export type FeadInput = Omit<Fead, 'id' | 'createdAt' | 'updatedAt'>;

// Frontend-specific helper type (for POC with mock data)
// This uses source names instead of IDs since we don't have a backend yet
export interface FeadWithNames {
  id: string;
  name: string;
  icon: string;
  sourceNames: string[]; // Temporary: source names for mock data
  createdAt: Date;
  updatedAt: Date;
}
