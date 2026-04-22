import axiosInterceptor from "@/services/axiosInterceptor";
import type { ApiParams } from "@/types/services";
import { API_ENDPOINTS } from "@/constants/api";

const extractErrorMessage = (error: any, defaultMessage: string): string => {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (typeof errors === "object" && !Array.isArray(errors)) {
      const allErrors = Object.values(errors).flat() as string[];
      return allErrors.join(", ");
    } else if (Array.isArray(errors)) {
      return errors.join(", ");
    }
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return defaultMessage;
};

class LibraryService {
  async getLibraryData(data: ApiParams) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.LIBRARY.LIST}?contentType=${data.contentType}&page=${data.page}&pageSize=${data.count}${data.searchTerm ? `&searchTerm=${data.searchTerm}` : ""}${data.isClubAdmin ? `&isClubAdmin=${data.isClubAdmin}` : ""}`,
    );

    if (response.data.status) {
      const { data, pagination } = response.data;

      return {
        success: true,
        data,
        pagination,
      };
    }

    return {
      success: false,
      error: response.data.message || "Login failed",
    };
  }

  async createUpdateContentFile(
    contentId: number,
    contentType: number,
    data: FormData,
  ) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.LIBRARY.CREATE_UPDATE_CONTENT_FILE}${contentId}?contentType=${contentType}`,
        data,
      );
      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to create update content file",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(
          error,
          "Failed to create update content file",
        ),
      };
    }
  }

  async getMiscData() {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.LIBRARY.MISC_DATA}`,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to get miscellaneous data"),
      };
    }
  }

  async getSkills() {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.LIBRARY.SKILLS}`,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to get skills data"),
      };
    }
  }

  async createUpdateModule(id: number, data: any) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.LIBRARY.CREATE_UPDATE_MODULE}${id}`,
        data,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to create update module"),
      };
    }
  }

  async createUpdateLesson(id: number, data: any) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.LIBRARY.CREATE_UPDATE_LESSON}${id}`,
        data,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to create update lesson"),
      };
    }
  }

  async getContentById(id: string | number, contentType: number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.LIBRARY.CONTENT}${id}?contentType=${contentType}`,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to fetch content"),
      };
    }
  }

  async getLibraryDataById(id: string | number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.LIBRARY.LIBRARY}${id}`,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to fetch library"),
      };
    }
  }

  async createContent(data: any) {
    try {
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.LIBRARY.CREATE,
        data,
      );

      if (response.data) {
        const payload = response.data.data ?? response.data;
        return {
          success: true,
          data: payload,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to create library"),
      };
    }
  }

  async updateContent(id: string | number, contentType: number, data: any) {
    try {
      const response = await axiosInterceptor.put(
        `${API_ENDPOINTS.LIBRARY.UPDATE}${id}?contentType=${contentType}`,
        data,
      );

      if (response.data) {
        const payload = response.data.data ?? response.data;
        return {
          success: true,
          data: payload,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to update library"),
      };
    }
  }

  async deleteLibrary(id: string | number, contentType: number) {
    try {
      const response = await axiosInterceptor.delete(
        `${API_ENDPOINTS.LIBRARY.DELETE}${id}?contentType=${contentType}`,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to delete library"),
      };
    }
  }

  async createUpdateCourse(id: number, data: any) {
    try {
      const response = await axiosInterceptor.put(
        `${API_ENDPOINTS.LIBRARY.CREATE_UPDATE_COURSE}${id}`,
        data,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to update course"),
      };
    }
  }
}

export const libraryService = new LibraryService();
