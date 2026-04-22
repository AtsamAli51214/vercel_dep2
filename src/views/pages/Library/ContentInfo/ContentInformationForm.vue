<template>
  <div class="flex flex-col gap-6">
    <CourseInformation
      v-if="contentData?.contentType === 5"
      v-model:current-step="currentStep"
      :course-data="contentData"
      @refresh="handleRefresh"
      @cancel="handleCancel"
    />

    <AddFile
      v-else
      :content-data="contentData"
      :file-data="contentData?.media?.[0]"
      @existingFileRemoved="
        (index: number) => emit('existingFileRemoved', index)
      "
      @refresh="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ContentData } from "@/types";
import AddFile from "./AddFile.vue";
import CourseInformation from "./CourseInformation.vue";
import { useRouter, useRoute } from "vue-router";

interface Props {
  contentData?: ContentData;
}

const currentStep = defineModel<number>("currentStep", { required: true });

defineProps<Props>();

const router = useRouter();
const route = useRoute();
const emit = defineEmits<{
  existingFileRemoved: [index: number];
  cancel: [];
}>();

const handleRefresh = () => {
  if (
    route.name === "editcourselesson" ||
    route.name === "editcoursemodule" ||
    route.name === "editcoursefile"
  ) {
    router.push({
      name: "contentdetail",
      params: {
        id: route.params.id,
        type: route.params.type,
      },
    });
  } else {
    const contentType = route.params.type as string;
    router.push({
      name: "library",
      query: { tab: contentType },
    });
  }
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<style scoped></style>
