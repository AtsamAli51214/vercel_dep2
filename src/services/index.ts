import axiosInterceptor from "@/services/axiosInterceptor";
import { authService } from "./authService";
import { federationService } from "./federationService";
import { userService } from "./userService";
import { supplierService } from "./supplierService";
import { ageCategoryService } from "./ageCategoryService";
import { teamService } from "./teamService";
import { clubService } from "./clubService";
import { libraryService } from "./LibraryService";
import {
  learningLineService,
  mapApiResponseToLearningLineWithPlan,
} from "./learningLineService";

export {
  authService,
  federationService,
  clubService,
  userService,
  supplierService,
  ageCategoryService,
  teamService,
  libraryService,
  learningLineService,
  mapApiResponseToLearningLineWithPlan,
};

export async function createUpdateItem<T>(
  endpoint: string,
  data: T,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const id = (data as { Id?: number }).Id;
    const isUpdate = id !== undefined && id > 0;

    let response;
    if (isUpdate) {
      response = await axiosInterceptor.put(`${endpoint}/${id}`, data);
    } else {
      response = await axiosInterceptor.post(endpoint, data);
    }

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
        error.response?.data?.message || error.message || "An error occurred",
    };
  }
}
