import { API_ENDPOINTS } from "@/constants/api";
import axiosInterceptor from "@/services/axiosInterceptor";
import type {
  LoginResponse,
  UserSession,
  LoginValues,
  LoginResult,
} from "@/types/services";
import { ROLES } from "@/constants/roles";

class AuthService {
  private decodeJWT = (
    token: string,
  ): { exp?: number; [key: string]: any } | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return null;
    }
  };

  private getPermissionsByRole = (role: string): string[] => {
    const permissions: Record<string, string[]> = {
      Admin: [
        "canCreateSchools",
        "canViewSchools",
        "canManageTrainers",
        "canManagePlayers",
        "canManageHashtags",
        "canManageCourts",
        "canManageTrainings",
        "canManageClubs",
      ],
      ClubAdmin: [
        "canManageTrainers",
        "canManagePlayers",
        "canManageHashtags",
        "canManageCourts",
        "canManageTrainings",
        "canManageClubs",
      ],
    };

    return permissions[role] || [];
  };

  async login(values: LoginValues): Promise<LoginResult> {
    const response = await axiosInterceptor.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      values,
    );

    if (response.data.status) {
      const { data } = response.data;

      if (!data) {
        return {
          success: false,
          error: "Invalid response from server",
        };
      }

      const userSession: UserSession = {
        ...data,
        userId: data.userId || data.id,
        email: data.email,
        permissions: this.getPermissionsByRole(data.roles[0]),
        isSuperAdmin: data.roles.includes(ROLES.SUPER_ADMIN),
      };

      localStorage.setItem("userSession", JSON.stringify(userSession));

      return {
        success: true,
      };
    }

    return {
      success: false,
      error: response.data.message || "Login failed",
    };
  }

  async forgotPassword(data: {
    email: string;
    isCreatePassword: boolean;
  }): Promise<LoginResult> {
    try {
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.AUTH.SEND_PASSWORD_LINK,
        data,
      );

      if (response.data.status) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to send reset link",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send reset link",
      };
    }
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;

    const decoded = this.decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  hasPermission(
    userPermissions: string[] | undefined,
    permission: string,
  ): boolean {
    return userPermissions?.includes(permission) || false;
  }

  getUserInfo(): UserSession | null {
    const userSession = localStorage.getItem("userSession");
    return userSession ? (JSON.parse(userSession) as UserSession) : null;
  }

  logout(): void {
    localStorage.removeItem("userSession");
    window.location.href = "/auth/login";
  }

  async validatePasswordToken(data: {
    token: string;
    email: string;
  }): Promise<LoginResult> {
    try {
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.AUTH.VALIDATE_PASSWORD_TOKEN,
        data,
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to validate password token",
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to validate password token",
      };
    }
  }
}

export const authService = new AuthService();
