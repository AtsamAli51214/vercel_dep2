import { ref } from "vue";
import { learningLineService } from "@/services";

export interface LibraryContentItem {
  id: number;
  title: string;
  contentType: number;
  [key: string]: unknown;
}

export interface LibraryContentDropdownItem {
  id: number;
  title: string;
}

export interface LibraryContentData {
  dropdownOptions: LibraryContentDropdownItem[];
  rawData: LibraryContentItem[];
  isLoading: boolean;
}

const contentCache = ref<Map<number, LibraryContentData>>(new Map());

export function useLearningLineLibraryContent() {
  async function loadContentByType(
    contentType: number,
  ): Promise<LibraryContentData> {
    const cached = contentCache.value.get(contentType);
    if (cached && !cached.isLoading) {
      return cached;
    }

    const loadingData: LibraryContentData = {
      dropdownOptions: [],
      rawData: [],
      isLoading: true,
    };
    contentCache.value.set(contentType, loadingData);

    try {
      const response = await learningLineService.getLearningLineContentAll({
        contentType,
      });

      if (response.success && response.data) {
        const rawData = response.data as LibraryContentItem[];
        const dropdownOptions = rawData.map((item) => ({
          id: item.id,
          title: item.title,
        }));

        const resultData: LibraryContentData = {
          dropdownOptions,
          rawData,
          isLoading: false,
        };

        contentCache.value.set(contentType, resultData);
        return resultData;
      }

      const errorData: LibraryContentData = {
        dropdownOptions: [],
        rawData: [],
        isLoading: false,
      };
      contentCache.value.set(contentType, errorData);
      return errorData;
    } catch (error) {
      console.error("Failed to load library content:", error);
      const errorData: LibraryContentData = {
        dropdownOptions: [],
        rawData: [],
        isLoading: false,
      };
      contentCache.value.set(contentType, errorData);
      return errorData;
    }
  }

  function getContentData(contentType: number | null): LibraryContentData {
    if (contentType == null) {
      return {
        dropdownOptions: [],
        rawData: [],
        isLoading: false,
      };
    }
    return (
      contentCache.value.get(contentType) ?? {
        dropdownOptions: [],
        rawData: [],
        isLoading: false,
      }
    );
  }

  function getDropdownOptions(
    contentType: number | null,
  ): LibraryContentDropdownItem[] {
    return getContentData(contentType).dropdownOptions;
  }

  function getRawData(contentType: number | null): LibraryContentItem[] {
    return getContentData(contentType).rawData;
  }

  function isLoading(contentType: number | null): boolean {
    return getContentData(contentType).isLoading;
  }

  function getContentItemById(
    contentType: number | null,
    contentId: number | null,
  ): LibraryContentItem | null {
    if (contentType == null || contentId == null) return null;
    const data = getContentData(contentType);
    return data.rawData.find((item) => item.id === contentId) ?? null;
  }

  function clearCache() {
    contentCache.value.clear();
  }

  return {
    loadContentByType,
    getContentData,
    getDropdownOptions,
    getRawData,
    isLoading,
    getContentItemById,
    clearCache,
  };
}
