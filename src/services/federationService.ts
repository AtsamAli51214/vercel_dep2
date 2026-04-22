import axiosInterceptor from "@/services/axiosInterceptor";
import type { ApiParams } from "@/types/services";
import { API_ENDPOINTS } from "@/constants/api";

class FederationService {
  async getAllFederations() {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.FEDERATIONS.ALL}`
    );
    return response.data;
  }

  async getFederationsByCountry(country: string) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.FEDERATIONS.BY_COUNTRY}?country=${country}`
    );
    return response.data;
  }

  async getFederationsData(data: ApiParams) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.FEDERATIONS.LIST}?pageNumber=${data.page}&pageSize=${data.count}`
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

  async getFederationById(id: string | number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.FEDERATIONS.FEDERATION}${id}`
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
          "Failed to fetch federation",
      };
    }
  }

  async createFederation(data: any) {
    try {
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.FEDERATIONS.CREATE,
        data
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
          "Failed to create federation",
      };
    }
  }

  async updateFederation(id: string | number, data: any) {
    try {
      const response = await axiosInterceptor.put(
        `${API_ENDPOINTS.FEDERATIONS.UPDATE}${id}`,
        data
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
          "Failed to update federation",
      };
    }
  }

  async deleteFederation(id: string | number) {
    try {
      const response = await axiosInterceptor.delete(
        `${API_ENDPOINTS.FEDERATIONS.DELETE}${id}`
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

export const federationService = new FederationService();
