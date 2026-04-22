import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  federationService,
  clubService,
  ageCategoryService,
  libraryService,
} from "@/services";
import type { Federation, Club, AgeCategory } from "@/types";

const COUNTRY_NAMES: Record<string, string> = {
  NL: "Netherlands",
  BE: "Belgium",
};

const getCountryName = (countryCode: string | null | undefined): string => {
  if (!countryCode) return "Other";
  return COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode;
};

export const useReferenceDataStore = defineStore("referenceData", () => {
  const federations = ref<Federation[]>([]);
  const clubs = ref<Club[]>([]);
  const ageCategories = ref<AgeCategory[]>([]);
  const skills = ref<any[]>([]);
  const federationsLoading = ref(false);
  const clubsLoading = ref(false);
  const ageCategoriesLoading = ref(false);
  const skillsLoading = ref(false);
  const federationsError = ref<string | null>(null);
  const clubsError = ref<string | null>(null);
  const ageCategoriesError = ref<string | null>(null);
  const skillsError = ref<string | null>(null);
  const federationsLastFetch = ref<number | null>(null);
  const clubsLastFetch = ref<number | null>(null);
  const ageCategoriesLastFetch = ref<number | null>(null);
  const skillsLastFetch = ref<number | null>(null);

  const CACHE_DURATION = 1 * 60 * 1000;

  const federationOptions = computed(() =>
    federations.value.map((fed) => ({
      name: fed.name,
      value: fed.id,
      label: fed.name,
    })),
  );

  const clubOptions = computed(() =>
    clubs.value.map((club) => ({
      name: club.name,
      value: club.id,
      label: club.name,
      countryName: getCountryName(club.country),
    })),
  );

  const ageCategoryOptions = computed(() =>
    ageCategories.value.map((category) => ({
      name: category.name,
      value: category.ageGroupId,
      label: category.name,
      isYoungestYouth: category.isYoungestYouth,
    })),
  );

  const skillOptions = computed(() =>
    skills.value.map((skill) => ({
      value: skill.id,
      label: skill.title,
      name: skill.title,
    })),
  );

  const getAgeGroupName = (ageGroupId: number) => {
    return (
      ageCategories.value.find((category) => category.ageGroupId === ageGroupId)
        ?.name || "-"
    );
  };

  const getSkillName = (skillId: number) => {
    return skills.value.find((skill) => skill.id === skillId)?.title || "-";
  };

  const isFederationsCacheValid = computed(() => {
    if (!federationsLastFetch.value) return false;
    return Date.now() - federationsLastFetch.value < CACHE_DURATION;
  });

  const isClubsCacheValid = computed(() => {
    if (!clubsLastFetch.value) return false;
    return Date.now() - clubsLastFetch.value < CACHE_DURATION;
  });

  const isAgeCategoriesCacheValid = computed(() => {
    if (!ageCategoriesLastFetch.value) return false;
    return Date.now() - ageCategoriesLastFetch.value < CACHE_DURATION;
  });

  const isSkillsCacheValid = computed(() => {
    if (!skillsLastFetch.value) return false;
    return Date.now() - skillsLastFetch.value < CACHE_DURATION;
  });

  const fetchFederations = async (force = false) => {
    if (
      !force &&
      isFederationsCacheValid.value &&
      federations.value.length > 0
    ) {
      return { success: true, data: federations.value };
    }

    federationsLoading.value = true;
    federationsError.value = null;

    try {
      const response = await federationService.getAllFederations();
      if (response.statusCode === 200) {
        federations.value = response.data;
        federationsLastFetch.value = Date.now();
        return { success: true, data: response.data };
      } else {
        federationsError.value = "Failed to fetch federations";
        return { success: false, error: federationsError.value };
      }
    } catch (error) {
      federationsError.value =
        error instanceof Error ? error.message : "Failed to fetch federations";
      console.error("Error fetching federations:", error);
      return { success: false, error: federationsError.value };
    } finally {
      federationsLoading.value = false;
    }
  };

  const fetchClubs = async (force = false) => {
    if (!force && isClubsCacheValid.value && clubs.value.length > 0) {
      return { success: true, data: clubs.value };
    }

    clubsLoading.value = true;
    clubsError.value = null;

    try {
      const response = await clubService.getAllClubs();
      if (response.status) {
        const mappedClubs = (response.data || []).map((club: any) => ({
          id: club.clubId,
          name: club.clubName,
          country: club.countryName || null,
        }));

        clubs.value = mappedClubs;
        clubsLastFetch.value = Date.now();
        return { success: true, data: mappedClubs };
      } else {
        clubsError.value = response.message || "Failed to fetch clubs";
        return { success: false, error: clubsError.value };
      }
    } catch (error) {
      clubsError.value =
        error instanceof Error ? error.message : "Failed to fetch clubs";
      console.error("Error fetching clubs:", error);
      return { success: false, error: clubsError.value };
    } finally {
      clubsLoading.value = false;
    }
  };

  const fetchAgeCategories = async (force = false) => {
    if (
      !force &&
      isAgeCategoriesCacheValid.value &&
      ageCategories.value.length > 0
    ) {
      return { success: true, data: ageCategories.value };
    }

    ageCategoriesLoading.value = true;
    ageCategoriesError.value = null;

    try {
      const response = await ageCategoryService.getAgeCategoriesData({
        page: 1,
        count: 1000,
      });

      if (response.success) {
        const mappedCategories = (response.data || []).map((category: any) => ({
          ageGroupId: category.ageGroupId,
          name: category.name,
          isYoungestYouth: Boolean(category.isYoungestYouth),
          ageCategory: category.ageCategory,
        }));

        ageCategories.value = mappedCategories;
        ageCategoriesLastFetch.value = Date.now();
        return { success: true, data: mappedCategories };
      } else {
        ageCategoriesError.value =
          response.error || "Failed to fetch age categories";
        return { success: false, error: ageCategoriesError.value };
      }
    } catch (error) {
      ageCategoriesError.value =
        error instanceof Error
          ? error.message
          : "Failed to fetch age categories";
      console.error("Error fetching age categories:", error);
      return { success: false, error: ageCategoriesError.value };
    } finally {
      ageCategoriesLoading.value = false;
    }
  };

  const fetchSkills = async (force = false) => {
    if (!force && isSkillsCacheValid.value && skills.value.length > 0) {
      return { success: true, data: skills.value };
    }

    skillsLoading.value = true;
    skillsError.value = null;

    try {
      const response = await libraryService.getSkills();

      if (response.success) {
        skills.value = response.data.data || [];
        skillsLastFetch.value = Date.now();
        return { success: true, data: skills.value };
      } else {
        skillsError.value = response.error || "Failed to fetch skills";
        return { success: false, error: skillsError.value };
      }
    } catch (error) {
      skillsError.value =
        error instanceof Error ? error.message : "Failed to fetch skills";
      console.error("Error fetching skills:", error);
      return { success: false, error: skillsError.value };
    } finally {
      skillsLoading.value = false;
    }
  };

  const fetchAll = async (force = false) => {
    const [federationsResult, clubsResult, ageCategoriesResult, skillsResult] =
      await Promise.all([
        fetchFederations(force),
        fetchClubs(force),
        fetchAgeCategories(force),
        fetchSkills(force),
      ]);

    return {
      success:
        federationsResult.success &&
        clubsResult.success &&
        ageCategoriesResult.success &&
        skillsResult.success,
      federations: federationsResult,
      clubs: clubsResult,
      ageCategories: ageCategoriesResult,
      skills: skillsResult,
    };
  };

  const clearCache = () => {
    federationsLastFetch.value = null;
    clubsLastFetch.value = null;
    ageCategoriesLastFetch.value = null;
    skillsLastFetch.value = null;
  };

  const clearFederationsCache = () => {
    federationsLastFetch.value = null;
  };

  const clearClubsCache = () => {
    clubsLastFetch.value = null;
  };

  const clearAgeCategoriesCache = () => {
    ageCategoriesLastFetch.value = null;
  };

  const clearSkillsCache = () => {
    skillsLastFetch.value = null;
  };

  const refreshIfStale = async () => {
    const promises = [];

    if (!isFederationsCacheValid.value && federations.value.length > 0) {
      promises.push(fetchFederations(true));
    }

    if (!isClubsCacheValid.value && clubs.value.length > 0) {
      promises.push(fetchClubs(true));
    }

    if (!isAgeCategoriesCacheValid.value && ageCategories.value.length > 0) {
      promises.push(fetchAgeCategories(true));
    }

    if (!isSkillsCacheValid.value && skills.value.length > 0) {
      promises.push(fetchSkills(true));
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refreshIfStale();
      }
    });
  }

  return {
    federations,
    clubs,
    ageCategories,
    skills,
    federationsLoading,
    clubsLoading,
    ageCategoriesLoading,
    skillsLoading,
    federationsError,
    clubsError,
    ageCategoriesError,
    skillsError,
    federationOptions,
    clubOptions,
    ageCategoryOptions,
    skillOptions,
    getAgeGroupName,
    getSkillName,
    isFederationsCacheValid,
    isClubsCacheValid,
    isAgeCategoriesCacheValid,
    isSkillsCacheValid,
    fetchFederations,
    fetchClubs,
    fetchAgeCategories,
    fetchSkills,
    fetchAll,
    clearCache,
    clearFederationsCache,
    clearClubsCache,
    clearAgeCategoriesCache,
    clearSkillsCache,
    refreshIfStale,
  };
});
