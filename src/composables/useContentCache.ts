import { libraryService } from "@/services";

// Module-level cache shared across all component instances
const contentCache = new Map<string, any>();

/**
 * Composable for caching content API responses
 * Reduces redundant getContentById calls by caching results per content ID
 */
export const useContentCache = () => {
  /**
   * Generate cache key from content ID and type
   */
  const getCacheKey = (id: number | string, contentType: number): string => {
    return `${id}_${contentType}`;
  };

  /**
   * Get content by ID with caching
   * First call fetches from API and caches, subsequent calls return cached result
   */
  const getContentByIdCached = async (
    id: number | string,
    contentType: number,
  ) => {
    const cacheKey = getCacheKey(id, contentType);

    // Return cached result if available
    if (contentCache.has(cacheKey)) {
      return contentCache.get(cacheKey);
    }

    // Fetch from API and cache the result
    const response = await libraryService.getContentById(id, contentType);

    // Only cache successful responses
    if (response.success) {
      contentCache.set(cacheKey, response);
    }

    return response;
  };

  const invalidateContent = (id: number | string): void => {
    const idStr = String(id);

    // Remove all entries that start with this ID
    for (const key of contentCache.keys()) {
      if (key.startsWith(`${idStr}_`)) {
        contentCache.delete(key);
      }
    }
  };

  /**
   * Clear entire cache (useful for logout or global refresh)
   */
  const clearCache = (): void => {
    contentCache.clear();
  };

  return {
    getContentByIdCached,
    invalidateContent,
    clearCache,
  };
};
