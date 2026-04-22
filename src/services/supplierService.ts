import axiosInterceptor from "@/services/axiosInterceptor";
import type { ApiParams } from "@/types/services";
import { API_ENDPOINTS } from "@/constants/api";

class SupplierService {
  async getAllSuppliers() {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.SUPPLIERS.ALL}?pageNumber=1&pageSize=1000`
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data || [],
          statusCode: 200,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to fetch suppliers",
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch suppliers",
        statusCode: error.response?.status || 500,
      };
    }
  }

  async getSuppliersByFederation(federation: string) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.SUPPLIERS.BY_FEDERATION}?federationId=${federation}`
    );
    return response.data;
  }

  async getSuppliersData(data: ApiParams) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.SUPPLIERS.ALL}?pageNumber=${data.page}&pageSize=${data.count}`
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

  async getSupplierById(id: string | number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.SUPPLIERS.SUPPLIER}${id}`
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
          "Failed to fetch supplier",
      };
    }
  }

  async createSupplier(data: any) {
    try {
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.SUPPLIERS.CREATE,
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
          "Failed to create supplier",
      };
    }
  }

  async updateSupplier(id: string | number, data: any) {
    try {
      const response = await axiosInterceptor.put(
        `${API_ENDPOINTS.SUPPLIERS.UPDATE}${id}`,
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
          "Failed to update supplier",
      };
    }
  }

  async deleteSupplier(id: string | number) {
    try {
      const response = await axiosInterceptor.delete(
        `${API_ENDPOINTS.SUPPLIERS.DELETE}${id}`
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

export const supplierService = new SupplierService();
