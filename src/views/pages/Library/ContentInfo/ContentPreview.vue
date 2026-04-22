<template>
  <div class="flex flex-col gap-6 w-full">
    <span class="font-bold text-3xl text-primary" v-if="isCourse">{{
      contentData?.title
    }}</span>

    <CarouselView
      v-if="
        contentData?.media?.[0]?.files && contentData.media[0].files.length > 0
      "
      :files="contentData.media[0].files"
      :fileType="contentData.media[0].type"
    />

    <div
      class="flex flex-col gap-8"
      v-if="
        contentData?.contentType === 5 &&
        ((contentData?.media?.[0] as any)?.description ||
          contentData?.description)
      "
    >
      <span class="font-medium text-xl">
        {{ t("Academy.library.description") }}
      </span>
      <div
        class="font-inter text-text-1 description-context"
        v-html="
          (contentData?.media?.[0] as any)?.description ||
          contentData?.description
        "
      />
    </div>

    <div
      class=""
      v-if="
        contentData.contentType === 4 &&
        contentData?.linkedSkills &&
        contentData.linkedSkills.length > 0
      "
    >
      <span class="font-medium text-xl">{{
        t("Academy.library.relatedSkill")
      }}</span>
      <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
        <div
          class="flex gap-4 items-center cursor-pointer hover:bg-primary-50 rounded-xl p-2"
          @click="handleSkillClick(skill)"
          v-for="skill in contentData.linkedSkills"
          :key="skill.id"
        >
          <img
            v-if="skill.thumbnailUrl"
            :src="
              skill.thumbnailUrl +
              (skill.thumbnailUrl.includes('imgix.net') ? '?auto=format' : '')
            "
            class="w-32! min-h-21 object-fit rounded-xl"
          />
          <div
            v-else
            class="flex justify-center items-center bg-bg-gray w-32 min-h-21 rounded-xl"
          >
            <img :src="NoFileIcon" alt="content icon" class="w-4" />
          </div>
          <span class="font-semibold text-sm text-primary">
            {{ skill.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex gap-2 w-full md:w-1/2" v-if="!embedded">
      <Button
        v-if="isModule"
        :label="t('Academy.library.courseContent.editModule')"
        @click="emit('editModule')"
        outlined
        fluid
      />
      <Button
        :label="
          isModule
            ? hasLessons
              ? t('Academy.library.lessonForm.editLessons')
              : t('Academy.library.lessonForm.addLessons')
            : contentData.media && contentData.media.length > 0
              ? t('app.edit')
              : t('Academy.library.courseContent.addFile')
        "
        @click="emit('edit')"
        outlined
        fluid
      />
      <Button :label="t('app.close')" @click="emit('close')" fluid />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContentData } from "@/types/common";
import { useI18n } from "vue-i18n";
import CarouselView from "./CarouselView.vue";
import { NoFileIcon } from "@/assets/images";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const props = withDefaults(
  defineProps<{
    isCourse?: boolean;
    embedded?: boolean;
    contentData: ContentData;
    isModule?: boolean;
    hasLessons?: boolean;
  }>(),
  {
    embedded: false,
  },
);

const emit = defineEmits<{
  edit: [];
  editModule: [];
  close: [];
}>();

const handleSkillClick = (skill: any) => {
  router.push(`/pages/library/detail/${skill.id}/${1}`);
};
</script>

<style>
@import "@/assets/styles/components/base-editor.css";
</style>
