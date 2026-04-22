<template>
  <div
    class="flex justify-center gap-6"
    :class="embedded ? 'min-h-0 max-h-[min(90vh,48rem)] overflow-y-auto' : ''"
  >
    <div
      class="bg-white rounded-2xl p-15 relative"
      :class="[
        isCourse ? 'w-300' : 'w-232',
        embedded ? 'w-full! max-w-full p-6!' : '',
      ]"
    >
      <div
        v-if="!embedded"
        @click="goBack"
        class="absolute mt-2 transition-opacity cursor-pointer left-10 hover:opacity-80"
      >
        <img :src="BackArrow" alt="back" />
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center" v-if="!embedded">
          <span class="font-bold text-3xl text-primary">{{
            contentData?.title
          }}</span>
          <Button icon="pi pi-pencil" text @click="editDetail" />
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex gap-2" v-if="expandedLabels.length > 0">
            <Tag
              v-for="(label, index) in expandedLabels"
              :key="index"
              :value="label"
              class=""
              severity="secondary"
              rounded
              :pt="{
                label: { class: 'text-xs font-medium' },
                root: { class: 'border' },
              }"
            />
          </div>
          <div class="flex gap-6">
            <div
              class="flex items-center gap-2 text-xs"
              v-if="
                contentData?.ageGroupIds && contentData.ageGroupIds.length > 0
              "
            >
              {{ t("Academy.library.formAgeCategories") }}:
              <BaseExtras
                :items="
                  contentData?.ageGroupIds?.map((ageGroupId: number) =>
                    referenceDataStore.getAgeGroupName(ageGroupId),
                  )
                "
                :visible-count="2"
                separator=", "
                item-key="item"
              >
                <template #item="{ item }">
                  <span class="text-primary">
                    {{ item }}
                  </span>
                </template>
              </BaseExtras>
            </div>
            <div
              class="flex items-center gap-2 text-xs"
              v-if="contentData?.themeIds && contentData.themeIds.length > 0"
            >
              {{ t("Academy.library.formThemes") }}:
              <BaseExtras
                :items="
                  contentData?.themeIds?.map((themeId: number) =>
                    getThemeName(t, themeId),
                  )
                "
                :visible-count="2"
                separator=", "
                item-key="item"
              >
                <template #item="{ item }">
                  <span class="text-primary">
                    {{ item }}
                  </span>
                </template>
              </BaseExtras>
            </div>
            <div
              class="flex items-center gap-2 text-xs"
              v-if="contentData?.categoryId"
            >
              {{ t("Academy.library.formMainCategory") }}:
              <span class="text-primary">
                {{ getMainCategoryName(t, contentData.categoryId) }}
              </span>
            </div>
            <div
              class="flex items-center gap-2 text-xs"
              v-if="contentData?.levelId"
            >
              {{ t("Academy.library.formLevel") }}:
              <span class="text-primary">
                {{ getLevelName(t, contentData.levelId) }}
              </span>
            </div>
          </div>

          <div
            class="text-text-1 description-context overflow-hidden"
            style="word-break: break-word; overflow-wrap: break-word"
            v-if="contentData.description"
            v-html="contentData.description"
          />
        </div>

        <ContentPreview
          v-if="contentData.id && !isCourse"
          :content-data="contentData"
          :is-course="isCourse"
          :embedded="embedded"
          @edit="goToEdit"
          @close="goBack"
        />
        <div v-else class="flex gap-4">
          <CourseContentNav
            :modules="modules"
            :files="files"
            :selected-key="selectedKey"
            @select="handleCourseItemSelect"
            class="w-60 shrink-0"
          />

          <Divider layout="vertical" />

          <div class="flex items-start gap-2 w-full">
            <ContentPreview
              v-if="displayPayload"
              :content-data="displayPayload"
              :is-course="isCourse"
              :is-module="selectedCourseItem?.type === 'module'"
              :has-lessons="
                selectedCourseItem?.type === 'module' &&
                ((selectedCourseItem.data as ModuleData)?.lessons?.length ??
                  0) > 0
              "
              :embedded="embedded"
              @edit="goToEdit"
              @editModule="goToEditModule"
              @close="goBack"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { BackArrow } from "@/assets/images";
import { useRoute, useRouter } from "vue-router";
import { useAppLoader, useContentCache } from "@/composables";
import { ContentData, FileData } from "@/types/common";
import ContentPreview from "./ContentInfo/ContentPreview.vue";
import CourseContentNav from "./ContentInfo/CourseContentNav.vue";
import { ModuleData, LessonData } from "./ContentInfo/types";
import {
  getThemeName,
  getLevelName,
  getExpandedLabelNames,
  getMainCategoryName,
} from "@/constants";
import { useI18n } from "vue-i18n";
import { useReferenceDataStore } from "@/stores/referenceData";

const props = withDefaults(
  defineProps<{
    contentId?: number | string;
    contentType?: number | string;
    embedded?: boolean;
  }>(),
  { embedded: false },
);

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
const router = useRouter();
const loader = useAppLoader();
const { t } = useI18n();
const referenceDataStore = useReferenceDataStore();
const { getContentByIdCached } = useContentCache();

const contentData = ref<ContentData>({});
const modules = ref<ModuleData[]>([]);
const files = ref<FileData[]>([]);
const selectedCourseItem = ref<{
  type: "file" | "module" | "lesson";
  data: any;
  key: string;
} | null>(null);
const selectedKey = ref<string>("");

const isCourse = computed(() => contentData.value?.contentType === 5);

const resolvedContentId = computed(() =>
  Number(props.contentId || route.params.id),
);

const resolvedContentType = computed(() =>
  Number(props.contentType || route.params.type),
);

const expandedLabels = computed(() => {
  if (!contentData.value?.labels) return [];
  return contentData.value.labels.flatMap((labelId: number) =>
    getExpandedLabelNames(t, labelId),
  );
});

onMounted(async () => {
  await Promise.all([
    referenceDataStore.fetchAgeCategories(),
    referenceDataStore.fetchSkills(),
  ]);
  if (resolvedContentId.value && resolvedContentType.value) {
    await getContentData();
  }
});

watch(
  [resolvedContentId, resolvedContentType],
  async ([id, type], [prevId, prevType]) => {
    if (!id || !type) return;
    if (prevId === id && prevType === type) return;
    await getContentData();
  },
);

const getContentData = async () => {
  loader.setLoading(true, t("loading.loadingContent"));
  try {
    selectedCourseItem.value = null;
    selectedKey.value = "";

    const response = await getContentByIdCached(
      resolvedContentId.value,
      resolvedContentType.value,
    );
    if (response.success) {
      const { data } = response;

      contentData.value = {
        id: data.id,
        contentType: data.contentType,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        themeIds: data.themeIds,
        levelId: data.levelId,
        ageGroupIds: data.ageGroupIds,
        tags: data.tagNames,
        labels: data.labels,
        media: data.media,
        linkedSkills: data.linkedSkills,
      };

      if (data.contentType === 5) {
        modules.value = data.modules || [];
        files.value = data.media || [];

        if (
          modules.value.length > 0 &&
          modules.value[0].lessons &&
          modules.value[0].lessons.length > 0
        ) {
          const firstLesson = modules.value[0].lessons[0];
          selectedKey.value = `lesson-0-0`;
          selectedCourseItem.value = {
            type: "lesson",
            data: firstLesson,
            key: selectedKey.value,
          };
        } else if (files.value.length > 0) {
          const firstFile = files.value[0];
          selectedKey.value = `file-${firstFile.id || 0}`;
          selectedCourseItem.value = {
            type: "file",
            data: firstFile,
            key: selectedKey.value,
          };
        } else if (modules.value.length > 0) {
          const firstModule = modules.value[0];
          selectedKey.value = `module-${firstModule.id || 0}`;
          selectedCourseItem.value = {
            type: "module",
            data: firstModule,
            key: selectedKey.value,
          };
        }
      }
    }
  } catch (error) {
    console.error("Error fetching content:", error);
  } finally {
    loader.setLoading(false);
  }
};

const displayPayload = computed(() => {
  if (!selectedCourseItem.value) return null;

  const { type, data } = selectedCourseItem.value;

  if (type === "lesson") {
    const lesson = data as LessonData;
    const filesArray: any[] = [];

    if (lesson.media && Array.isArray(lesson.media)) {
      lesson.media.forEach((media) => {
        filesArray.push({
          id: media.id,
          url: media.url,
          publicId: media.publicId,
          thumbnail: media.thumbnail,
          fileName: media.fileName,
          size: media.size,
          duration: media.duration,
          width: media.width,
          height: media.height,
        });
      });
    }

    return {
      title: lesson.title,
      description: lesson.description || "",
      media:
        filesArray.length > 0
          ? [
              {
                title: lesson.title,
                description: lesson.description || "",
                type: lesson.fileType || lesson.type,
                files: filesArray.filter(Boolean),
              },
            ]
          : [],
    };
  } else if (type === "module") {
    const module = data as ModuleData;
    return {
      title: module.title,
      description: module.description || "",
      media: [],
    };
  } else if (type === "file") {
    const file = data as FileData;
    return {
      title: file.title,
      description: file.description || "",
      media: [file],
    };
  }

  return null;
});

const handleCourseItemSelect = (payload: {
  type: "file" | "module" | "lesson";
  data: any;
  key: string;
}) => {
  selectedCourseItem.value = payload;
  selectedKey.value = payload.key;
};

const editDetail = () => {
  selectedCourseItem.value = null;
  selectedKey.value = "";
  router.push(
    `/pages/library/edit/${resolvedContentId.value}/${resolvedContentType.value}`,
  );
};

const goToEdit = (): void => {
  const contentType = contentData.value.contentType;
  const id = String(resolvedContentId.value);
  const type = String(resolvedContentType.value);

  if (contentType === 5 && selectedCourseItem.value) {
    const { type: itemType, data } = selectedCourseItem.value;

    if (itemType === "lesson") {
      const lesson = data as LessonData;
      router.push({
        name: "editcourselesson",
        params: { id, type, lessonId: lesson.id },
      });
    } else if (itemType === "module") {
      const module = data as ModuleData;
      router.push({
        name: "addlessons",
        params: { id, type, moduleId: module.id },
      });
    } else if (itemType === "file") {
      const file = data as FileData;
      router.push({
        name: "editcoursefile",
        params: { id, type, fileId: file.id },
      });
    }
  } else if (contentType === 5) {
    router.push({ name: "editcourse", params: { id, type } });
  } else if (contentData.value.media && contentData.value.media.length > 0) {
    router.push({ name: "editfile", params: { id, type } });
  } else {
    router.push({ name: "addfile", params: { id, type } });
  }
};

const goToEditModule = (): void => {
  if (selectedCourseItem.value?.type === "module") {
    const module = selectedCourseItem.value.data as ModuleData;
    router.push({
      name: "editcoursemodule",
      params: {
        id: resolvedContentId.value,
        type: resolvedContentType.value,
        moduleId: module.id,
      },
    });
  }
};

const goBack = (): void => {
  router.back();
};
</script>

<style>
@import "@/assets/styles/components/base-editor.css";
</style>
