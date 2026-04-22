import axiosInterceptor from "@/services/axiosInterceptor";
import type { ApiParams } from "@/types/services";
import { API_ENDPOINTS } from "@/constants/api";

class ClubService {
  async getAllClubs() {
    const response = await axiosInterceptor.get(`${API_ENDPOINTS.CLUBS.ALL}`);
    return response.data;
  }

  async getClubsData(data: ApiParams) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.CLUBS.LIST}?pageNumber=${data.page}&pageSize=${data.count}`
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

  async getClubById(id: string | number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.CLUBS.CLUB}${id}`
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
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch club",
      };
    }
  }

  async getClubDashboard(id: string | number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.CLUBS.CLUB_DASHBOARD}${id}`
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
        error: "Failed to fetch club dashboard",
      };
    }
  }

  async createClub(data: any) {
    try {
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.CLUBS.CREATE,
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
          "Failed to create club",
      };
    }
  }

  async updateClub(data: any) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.CLUBS.UPDATE}`,
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
          "Failed to update club",
      };
    }
  }

  async deleteClub(id: string | number, data: any) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.CLUBS.DELETE}${id}`,
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
          "Failed to delete club",
      };
    }
  }

  async uploadContract(id: string | number, data: FormData) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.CLUBS.UPLOAD_CONTRACT}${id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
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
          "Failed to upload contract",
      };
    }
  }

  async addContact(clubId: string | number, data: any) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.CLUBS.ADD_CONTACT}${clubId}`,
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
          "Failed to add contact",
      };
    }
  }

  async updateContact(clubId: string | number, contactId: number, data: any) {
    try {
      const response = await axiosInterceptor.put(
        `${API_ENDPOINTS.CLUBS.UPDATE_CONTACT}${clubId}/${contactId}`,
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
          "Failed to update contact",
      };
    }
  }
}

export const clubService = new ClubService();
