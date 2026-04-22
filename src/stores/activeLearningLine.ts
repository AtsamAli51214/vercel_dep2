import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import {
  learningLineService,
  mapApiResponseToLearningLineWithPlan,
} from "@/services";
import type { LearningLineDetailApi, LearningLineWithPlan } from "@/types";
import {
  extractDetailFromMutationResponse,
  findWeekInCachedDetail,
} from "@/utils/learningLineActiveCache";

export type { ActiveLearningLineWeekPayload } from "@/utils/learningLineActiveCache";

export const useActiveLearningLineStore = defineStore(
  "activeLearningLine",
  () => {
    const activeId = ref<string | null>(null);
    const plan = shallowRef<LearningLineWithPlan | null>(null);
    const rawDetail = shallowRef<LearningLineDetailApi | null>(null);

    const fetchesInFlight = new Map<
      string,
      Promise<{ success: boolean; error?: string }>
    >();

    function setCacheFromBody(body: unknown): void {
      const api =
        body && typeof body === "object"
          ? (body as LearningLineDetailApi)
          : ({} as LearningLineDetailApi);
      rawDetail.value = api;
      plan.value = mapApiResponseToLearningLineWithPlan(api);
      const id = api.id ?? (api as { Id?: number }).Id;
      activeId.value = id !== undefined && id !== null ? String(id) : null;
    }

    function clear(): void {
      activeId.value = null;
      plan.value = null;
      rawDetail.value = null;
      fetchesInFlight.clear();
    }

    async function loadFromApi(id: string | number): Promise<{
      success: boolean;
      error?: string;
    }> {
      const result = await learningLineService.getLearningLineById(id);
      if (result.success && result.data) {
        setCacheFromBody(result.data?.data ?? result.data);
        return { success: true };
      }
      const msg =
        result && typeof result === "object" && "error" in result
          ? String((result as { error?: string }).error)
          : undefined;
      return { success: false, error: msg };
    }

    async function ensureLoaded(
      id: string | number,
      options?: { force?: boolean },
    ): Promise<{ success: boolean; error?: string }> {
      const key = String(id);
      const cacheOk =
        !options?.force && rawDetail.value && activeId.value === key;
      if (cacheOk) {
        return { success: true };
      }

      const alreadyLoading = fetchesInFlight.get(key);
      if (alreadyLoading && !options?.force) {
        return alreadyLoading;
      }

      if (activeId.value !== null && activeId.value !== key) {
        plan.value = null;
        rawDetail.value = null;
        activeId.value = null;
      }

      const promise = (async () => {
        try {
          return await loadFromApi(id);
        } finally {
          fetchesInFlight.delete(key);
        }
      })();

      fetchesInFlight.set(key, promise);
      return promise;
    }

    function getWeekById(weekId: number) {
      const detail = rawDetail.value;
      if (!detail) return null;
      return findWeekInCachedDetail(detail, weekId);
    }

    async function syncAfterMutation(
      responseBody: unknown,
      learningLineId: string | number,
    ): Promise<void> {
      const detail = extractDetailFromMutationResponse(responseBody);
      if (detail) {
        setCacheFromBody(detail);
      } else {
        await ensureLoaded(learningLineId, { force: true });
      }
    }

    function clearIfMatches(id: string | number | null | undefined): void {
      if (id == null) return;
      if (activeId.value === String(id)) {
        clear();
      }
    }

    return {
      activeId,
      plan,
      rawDetail,
      ensureLoaded,
      applyFromApiBody: setCacheFromBody,
      clear,
      getWeekById,
      syncAfterMutation,
      clearIfMatches,
    };
  },
);
