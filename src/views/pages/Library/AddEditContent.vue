<template>
  <div class="flex justify-center gap-6">
    <div class="bg-white rounded-2xl p-15 w-232 relative">
      <div
        @click="goBack"
        class="absolute mt-2 transition-opacity cursor-pointer left-10 hover:opacity-80"
      >
        <img :src="BackArrow" alt="back" />
      </div>

      <ContentForm
        v-if="currentStep === 1 && (!isEditMode || contentData.id)"
        :contentData="contentData"
        :isEditMode="isEditMode"
        @contentCreated="handleContentCreated"
        @cancel="goBack"
      />

      <ContentInformationForm
        v-if="currentStep >= 2 && contentData"
        v-model:current-step="currentStep"
        :contentData="contentData"
        @existingFileRemoved="
          (index: number) => handleExistingFileRemoved(index)
        "
        @cancel="goBack"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { BackArrow } from "@/assets/images";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ContentForm from "./ContentInfo/ContentForm.vue";
import ContentInformationForm from "./ContentInfo/ContentInformationForm.vue";
import { useAppLoader, useContentCache } from "@/composables";
import { ContentData, TableDataRef } from "@/types/common";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const loader = useAppLoader();
const { getContentByIdCached } = useContentCache();

const contentData = ref<ContentData>({});
const currentStep = ref(1);
const deletedFileIds = ref<number[]>([]);

const isEditMode = computed(() => !!route.params.id);

onMounted(async () => {
  if (isEditMode.value) {
    getContentData();
  }
});

const getContentData = async () => {
  loader.setLoading(true, t("loading.loadingContent"));
  try {
    const response = await getContentByIdCached(
      Number(route.params.id),
      Number(route.params.type),
    );
    if (response.success) {
      const { data } = response;

      if (
        route.name === "editcourse" ||
        route.name === "editcourselesson" ||
        route.name === "editcoursemodule" ||
        route.name === "editcoursefile" ||
        route.name === "addlessons"
      ) {
        currentStep.value = 2;
      }

      contentData.value = {
        id: data.id,
        contentType: data.contentType,
        title: data.title,
        description: data.description,
        easierExercise:
          (data as any).easierExercise ?? (data as any).EasierExercise ?? null,
        difficultExercise:
          (data as any).difficultExercise ??
          (data as any).DifficultExercise ??
          null,
        categoryId: data.categoryId,
        themeIds: data.themeIds,
        levelId: data.levelId,
        ageGroupIds: data.ageGroupIds,
        tags: data.tagNames,
        linkedSkillIds:
          data.linkedSkills && data.linkedSkills.length > 0
            ? data.linkedSkills.map((skill: TableDataRef) => skill.id)
            : [],
        labels: data.labels,
        media: data.media,
        isPublished: data.isPublished,
        isDraft: data.isDraft,
      };
    }
  } catch (error) {
    console.error("Error fetching content:", error);
  } finally {
    loader.setLoading(false);
  }
};

const handleContentCreated = (payload: any) => {
  const entity = payload?.data ?? payload;
  contentData.value = entity;

  const contentId = entity.id;
  const contentType = entity.contentType;

  if (contentType === 5) {
    currentStep.value = 2;
    router.replace({
      name: "editcourse",
      params: { id: contentId, type: contentType },
    });
  } else {
    router.replace({
      name: "contentdetail",
      params: { id: contentId, type: contentType },
    });
  }
};

const handleExistingFileRemoved = (index: number) => {
  if (
    contentData.value?.media?.[0]?.files &&
    contentData.value.media[0].files[index]
  ) {
    const fileId = contentData.value.media[0].files[index].id;
    if (fileId) {
      deletedFileIds.value.push(fileId);
    }
    contentData.value.media[0].files.splice(index, 1);
  }
};

const goBack = (): void => {
  if (currentStep.value > 2) {
    currentStep.value = 2;
  } else if (currentStep.value === 2) {
    if (route.name === "addfile") {
      if (contentData.value?.contentType === 5) {
        router.back();
      } else {
        currentStep.value = 1;
      }
    } else if (route.name === "editcourse") {
      if (!contentData.value?.isPublished && !contentData.value?.isDraft) {
        currentStep.value = 1;
      } else {
        router.back();
      }
    } else if (route.name === "editfile") {
      router.back();
    } else if (
      route.name === "editcourselesson" ||
      route.name === "editcoursemodule" ||
      route.name === "editcoursefile" ||
      route.name === "addlessons"
    ) {
      router.push({
        name: "contentdetail",
        params: {
          id: route.params.id,
          type: route.params.type,
        },
      });
    } else {
      currentStep.value = 1;
    }
  } else {
    router.back();
  }
};
</script>

<style scoped></style>
