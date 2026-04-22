import axiosInterceptor from "@/services/axiosInterceptor";
import type { ApiParams } from "@/types/services";
import { API_ENDPOINTS } from "@/constants/api";

class UserService {
  async getUsersData(data: ApiParams) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.USERS.ALL}?pageNumber=${data.page}&pageSize=${data.count}`
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

  async getUserById(id: string | number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.USERS.USER}${id}`
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
          "Failed to fetch user",
      };
    }
  }

  async createUser(data: any) {
    try {
      let { IsLogoUpdate, ...requestData } = data;
      const formData = new FormData();
      Object.entries(requestData).forEach(([key, value]) => {
        if ((key === "Logo" || key === "LogoFile") && value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          if (
            typeof value === "object" &&
            !(value instanceof File) &&
            value !== null
          ) {
            const stringified = JSON.stringify(value);
            formData.append(key, stringified);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      requestData = formData;
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.USERS.CREATE,
        requestData
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
          "Failed to create user",
      };
    }
  }

  async updateUser(id: string | number, data: any) {
    try {
      let { Email, ...requestData } = data;
      if (
        requestData.Logo ||
        requestData.LogoFile ||
        requestData.ClubRoles ||
        requestData.UserId
      ) {
        const formData = new FormData();
        Object.entries(requestData).forEach(([key, value]) => {
          if ((key === "Logo" || key === "LogoFile") && value instanceof File) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            if (
              typeof value === "object" &&
              !(value instanceof File) &&
              value !== null
            ) {
              const stringified = JSON.stringify(value);
              formData.append(key, stringified);
            } else {
              formData.append(key, String(value));
            }
          }
        });
        requestData = formData;
      }
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.USERS.UPDATE}${id}`,
        requestData
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
          "Failed to update user",
      };
    }
  }

  async createPassword(data: any) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.USERS.CREATE_PASSWORD}`,
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
          "Failed to create password",
      };
    }
  }

  async deleteUser(id: string | number, action: string) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.USERS.DELETE}${id}?action=${action}`
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
          "Failed to delete user",
      };
    }
  }
}

export const userService = new UserService();
