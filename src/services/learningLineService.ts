import axiosInterceptor from "@/services/axiosInterceptor";
import type { ApiParams } from "@/types/services";
import type {
  LearningLineDetailApi,
  LearningLineWeek,
  LearningLineWeekSection,
  LearningLineWithPlan,
  TableDataRef,
} from "@/types";
import { API_ENDPOINTS } from "@/constants/api";

function mapWeekRecord(week: Record<string, unknown>): LearningLineWeek {
  return {
    id: week.id as number,
    name: week.name as string,
    weekNumber: week.weekNumber as number,
    startDate: week.startDate as string,
    endDate: week.endDate as string,
    position: week.position as number,
    notes: week.notes as string | null,
    description: week.description as string,
    contentCount: week.contentCount as number,
    contentCountByType: week.contentCountByType as Record<string, number>,
    totalWeeks: week.totalWeeks as number,
  };
}

function mapApiSegmentToSection(seg: unknown): LearningLineWeekSection {
  if (seg && typeof seg === "object") {
    const s = seg as Record<string, unknown>;
    const weeksRaw = (s.weeks ?? s.Weeks ?? []) as unknown[];
    const rawId = s.id ?? s.sectionId ?? s.Id ?? s.SectionId;
    const id =
      typeof rawId === "number" && !Number.isNaN(rawId) ? rawId : undefined;
    const section: LearningLineWeekSection = {
      weeks: weeksRaw.map((w) =>
        mapWeekRecord((w as Record<string, unknown>) ?? {}),
      ),
    };
    if (id !== undefined) {
      section.id = id;
    }
    return section;
  }
  return { weeks: [] };
}

export function mapApiResponseToLearningLineWithPlan(
  apiData: LearningLineDetailApi,
): LearningLineWithPlan {
  const segmentsRaw = (apiData.segments ?? []) as unknown[];
  const segments: LearningLineWeekSection[] = segmentsRaw.map((seg) =>
    mapApiSegmentToSection(seg),
  );
  return {
    id: (apiData.id as number) ?? 0,
    name: (apiData.name ?? "") as string,
    code: apiData.code as string | undefined,
    description: apiData.description as string | undefined,
    targetGroups: (apiData.targetGroups ?? []) as TableDataRef[],
    clubs: (apiData.clubs ?? []) as TableDataRef[],
    ageGroups: (apiData.ageGroups ?? []) as TableDataRef[],
    startDate: apiData.startDate as string | undefined,
    endDate: apiData.endDate as string | undefined,
    status: apiData.status as number | undefined,
    seasonId: apiData.seasonId as number | undefined,
    seasonName: apiData.seasonName as string | undefined,
    isRecurring: apiData.isRecurring as boolean,
    weekCount: apiData.weekCount as number | undefined,
    totalWeeks: apiData.totalWeeks as number | undefined,
    segments,
    source: apiData.source as string | undefined,
  };
}

class LearningLineService {
  async getAllLearningLines() {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.LEARNING_LINES.ALL}`,
    );
    return response.data;
  }

  async getLearningLinesData(data: ApiParams) {
    const response = await axiosInterceptor.get(
      `${API_ENDPOINTS.LEARNING_LINES.LIST}?page=${data.page}&pageSize=${data.count}`,
    );

    if (response.data?.status !== false) {
      const responseData = response.data?.data ?? response.data;
      const list = Array.isArray(responseData) ? responseData : [];
      const pagination = response.data?.pagination ?? {
        totalRecords: list.length,
      };
      return {
        success: true,
        data: list,
        pagination,
      };
    }

    return {
      success: false,
      error: response.data?.message || "Failed to load learning lines",
    };
  }

  async getLearningLineById(id: string | number) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.LEARNING_LINES.LEARNING_LINE}${id}`,
      );

      if (response.data) {
        const data = response.data?.data ?? response.data;
        return {
          success: true,
          data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch learning line",
      };
    }
  }

  async createLearningLine(data: Record<string, unknown>) {
    try {
      const response = await axiosInterceptor.post(
        API_ENDPOINTS.LEARNING_LINES.CREATE,
        data,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data?.data ?? response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to create learning line",
      };
    }
  }

  async updateLearningLine(id: string | number, data: Record<string, unknown>) {
    try {
      const response = await axiosInterceptor.put(
        `${API_ENDPOINTS.LEARNING_LINES.UPDATE}${id}`,
        data,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data?.data ?? response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to update learning line",
      };
    }
  }

  async deleteLearningLine(id: string | number) {
    try {
      const response = await axiosInterceptor.delete(
        `${API_ENDPOINTS.LEARNING_LINES.DELETE}${id}`,
      );

      if (response.data !== false) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      return {
        success: false,
        errorData: err.response?.data,
        error:
          (err.response?.data as { message?: string })?.message ||
          err.message ||
          "Failed to delete learning line",
      };
    }
  }

  async manageLearningLineWeeks(
    learningLineId: string | number,
    data: Record<string, unknown>,
  ) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.LEARNING_LINES.WEEKS_MANAGE}${learningLineId}`,
        data,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data?.data ?? response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to manage learning line weeks",
      };
    }
  }

  async duplicateLearningLineWeek(
    learningLineId: string | number,
    weekId: string | number,
  ) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.LEARNING_LINES.WEEK_DUPLICATE}${learningLineId}/${weekId}`,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data?.data ?? response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to duplicate learning line week",
      };
    }
  }

  async updateLearningLineWeek(
    learningLineId: string | number,
    weekId: string | number,
    data: Record<string, unknown>,
  ) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.LEARNING_LINES.UPDATE_WEEK_CONTENT}${learningLineId}/${weekId}`,
        data,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data?.data ?? response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message || err.message || "Failed to update week",
      };
    }
  }

  async duplicateLearningLine(
    learningLineId: string | number,
    data: Record<string, unknown>,
  ) {
    try {
      const response = await axiosInterceptor.post(
        `${API_ENDPOINTS.LEARNING_LINES.DUPLICATE}${learningLineId}`,
        data,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data?.data ?? response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to duplicate learning line",
      };
    }
  }

  async exportLearningLine(learningLineId: string | number, format: 1 | 2) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.LEARNING_LINES.EXPORT}${learningLineId}`,
        { params: { format } },
      );

      if (response.data) {
        return {
          success: true,
          data: response.data?.data ?? response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to export learning line",
      };
    }
  }

  async getLearningLineDashboard(
    id: string | number,
    params?: { genreId?: number; segmentId?: number },
  ) {
    try {
      const search = new URLSearchParams();
      if (params?.genreId != null && params.genreId > 0) {
        search.set("genreId", String(params.genreId));
      }
      if (params?.segmentId != null) {
        search.set("segmentId", String(params.segmentId));
      }
      const q = search.toString();
      const url = `${API_ENDPOINTS.LEARNING_LINES.DASHBOARD}${id}${q ? `?${q}` : ""}`;
      const response = await axiosInterceptor.get(url);
      if (response.data) {
        return {
          success: true,
          data: response.data?.data ?? response.data,
        };
      }
      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard graphs",
      };
    }
  }

  async getLearningLineWeekById(
    learningLineId: string | number,
    weekId: string | number,
  ) {
    try {
      const response = await axiosInterceptor.get(
        `${API_ENDPOINTS.LEARNING_LINES.WEEK_BY_ID}${learningLineId}/${weekId}`,
      );

      if (response.data) {
        return {
          success: true,
          data: response.data?.data ?? response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from server",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to get learning line week",
      };
    }
  }

  async getLearningLineContentAll(params?: {
    contentType?: number;
    searchTerm?: string;
  }) {
    try {
      const search = new URLSearchParams();
      if (params?.contentType != null) {
        search.set("contentType", String(params.contentType));
      }
      if (params?.searchTerm) {
        search.set("searchTerm", params.searchTerm);
      }
      const q = search.toString();
      const url = `${API_ENDPOINTS.LEARNING_LINES.CONTENT_ALL}${q ? `?${q}` : ""}`;
      const response = await axiosInterceptor.get(url);

      if (response.data?.status !== false) {
        const responseData = response.data?.data ?? response.data;
        const list = Array.isArray(responseData) ? responseData : [];
        const pagination = response.data?.pagination ?? {
          totalRecords: list.length,
        };
        return {
          success: true,
          data: list,
          pagination,
        };
      }

      return {
        success: false,
        error: response.data?.message || "Failed to load library content",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to load library content",
      };
    }
  }
}

export const learningLineService = new LearningLineService();
