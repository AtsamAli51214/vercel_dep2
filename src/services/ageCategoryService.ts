import axiosInterceptor from "@/services/axiosInterceptor";
import type { ApiParams } from "@/types/services";
import { API_ENDPOINTS } from "@/constants/api";

class AgeCategoryService {
  async getAgeCategoriesByClub(clubId: number) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.AGE_CATEGORIES.ALL}${clubId}`,
    );
    return response.data.data;
  }

  async getAgeCategoriesData(data: ApiParams) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.AGE_CATEGORIES.LIST}?pageNumber=${data.page}&pageSize=${data.count}`,
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

  async getAgeCategoryById(id: string | number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.AGE_CATEGORIES.AGE_CATEGORY}${id}`,
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
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch age category",
      };
    }
  }

  async createAgeCategory(data: any) {
    try {
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.AGE_CATEGORIES.CREATE,
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
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create age category",
      };
    }
  }

  async updateAgeCategory(id: string | number, data: any) {
    try {
      const response = await axiosInterceptor.put(
        `${API_ENDPOINTS.AGE_CATEGORIES.UPDATE}${id}`,
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
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update age category",
      };
    }
  }

  async deleteAgeCategory(id: string | number) {
    try {
      const response = await axiosInterceptor.delete(
        `${API_ENDPOINTS.AGE_CATEGORIES.DELETE}${id}`,
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
      const errorData = error.response?.data;
      return {
        success: false,
        errorData: errorData,
      };
    }
  }
}

export const ageCategoryService = new AgeCategoryService();
