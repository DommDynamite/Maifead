import type { ContentItem, FeedSource } from '@maifead/types';

/**
 * Apply source-level filters (whitelist/blacklist) to a content item
 * @param item The content item to check
 * @param source The feed source with filter configuration
 * @returns true if item should be shown, false if it should be filtered out
 */
export const applySourceFilters = (item: ContentItem, source: FeedSource): boolean => {
  // If source is disabled, don't show any items from it
  if (!source.isEnabled) {
    return false;
  }

  // Build searchable text from all relevant fields
  const searchableText = [
    item.title,
    item.content.text,
    item.content.excerpt || '',
    item.author?.name || '',
    ...(item.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  // Whitelist check (if whitelist exists)
  if (source.whitelistKeywords && source.whitelistKeywords.length > 0) {
    const passesWhitelist = source.whitelistKeywords.some(keyword =>
      searchableText.includes(keyword.toLowerCase())
    );
    if (!passesWhitelist) {
      return false; // Item doesn't match any whitelist keyword
    }
  }

  // Blacklist check
  if (source.blacklistKeywords && source.blacklistKeywords.length > 0) {
    const matchesBlacklist = source.blacklistKeywords.some(keyword =>
      searchableText.includes(keyword.toLowerCase())
    );
    if (matchesBlacklist) {
      return false; // Item matches a blacklist keyword
    }
  }

  return true; // Item passed all filters
};

/**
 * Apply source filters to an array of content items
 * @param items Array of content items
 * @param sources Map of source name to FeedSource for filtering
 * @returns Filtered array of content items
 */
export const applySourceFiltersToItems = (
  items: ContentItem[],
  sources: FeedSource[]
): ContentItem[] => {
  // Create a map for quick lookup by source name
  const sourceMap = new Map(sources.map(source => [source.name, source]));

  return items.filter(item => {
    const source = sourceMap.get(item.source.name);
    if (!source) {
      // If source not found in our store, show the item (backward compatibility)
      return true;
    }
    return applySourceFilters(item, source);
  });
};
