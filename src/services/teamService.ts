import axiosInterceptor from "@/services/axiosInterceptor";
import type { ApiParams } from "@/types/services";
import { API_ENDPOINTS } from "@/constants/api";

class TeamService {
  async getTeamsData(data: ApiParams) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.TEAMS.LIST}?pageNumber=${data.page}&pageSize=${data.count}`
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

  async getTeamById(id: string | number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.TEAMS.TEAM}${id}`
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
          "Failed to fetch team",
      };
    }
  }

  async createTeam(data: any) {
    try {
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.TEAMS.CREATE,
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
          "Failed to create team",
      };
    }
  }

  async updateTeam(data: any) {
    try {
      const response = await axiosInterceptor.put(
        `${API_ENDPOINTS.TEAMS.UPDATE}`,
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
          "Failed to update team",
      };
    }
  }

  async deleteTeam(id: string | number) {
    try {
      const response = await axiosInterceptor.delete(
        `${API_ENDPOINTS.TEAMS.DELETE}${id}`
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

  async getTeamsByClubAndAgeGroup(clubId: number, ageGroupId: number) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.TEAMS.BY_CLUB_AND_AGE_GROUP}${clubId}/${ageGroupId}`
    );

    return response.data.data;
  }
}

export const teamService = new TeamService();
