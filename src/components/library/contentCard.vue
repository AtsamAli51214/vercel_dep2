<template>
  <div
    v-for="item in contents"
    :key="item.id"
    class="flex flex-col rounded-xl cursor-pointer"
    @click="handleCardClick(item)"
  >
    <img
      v-if="item.thumbnailUrl"
      :src="
        item.thumbnailUrl +
        (item.thumbnailUrl.includes('imgix.net') ? '?auto=format' : '')
      "
      class="h-40 object-fit rounded-t-xl"
      style="width: 100%"
    />
    <div
      v-else
      class="flex justify-center items-center bg-bg-gray h-40 rounded-t-xl"
    >
      <img
        :src="
          item.files && item.files.length > 0 ? getImageUrl(item) : NoFileIcon
        "
        alt="content icon"
        class="w-8"
      />
    </div>
    <div class="flex flex-col bg-white! border rounded-b-xl border-t-0 p-4">
      <div class="flex justify-between items-center">
        <Tag
          v-if="item.isDraft"
          :value="t('app.draft')"
          severity="secondary"
          rounded
          :pt="{
            label: { class: 'text-xs font-medium text-primary' },
            root: { class: 'border shrink-0' },
          }"
        />
        <div v-else class="flex gap-1 items-center min-w-0">
          <img
            :src="getContentInfo(item.contentType)"
            alt="icon"
            class="w-4 h-4 shrink-0"
          />
          <span class="text-xs text-primary truncate">{{
            getContentInfo(item.contentType, true)
          }}</span>
        </div>
        <Button
          v-if="showMenu"
          icon="pi pi-ellipsis-v"
          @click.stop="(e) => toggleMenu(e, `Content-${item.id}`)"
          aria-haspopup="true"
          :aria-controls="`Content-menu-${item.id}`"
          severity="secondary"
          text
          rounded
          size="small"
        />
        <Menu
          v-if="showMenu"
          :ref="setMenuRef(`Content-${item.id}`)"
          :id="`Content-menu-${item.id}`"
          :model="computedMenuItems(item)"
          :popup="true"
        />
      </div>
      <div class="flex flex-col gap-1">
        <span class="font-semibold text-primary leading-6 truncate">{{
          item.title
        }}</span>
        <span
          class="text-[.635rem] text-text-3 font-medium"
          v-if="item.contentType !== 4"
          >{{ getMainCategoryName(t, item.categoryId ?? 0) }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Content">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { Content } from "@/types";
import {
  NoFileIcon,
  VideoFadeIcon,
  ImageFadeIcon,
  FileFadeIcon,
  ExerciseIcon,
  SkillIcon,
  ArticleIcon,
  GuideIcon,
  CourseIcon,
  MiscIcon,
} from "@/assets/images";
import { getMainCategoryName } from "@/constants/formOptions";

interface Props {
  contents: T[];
  showMenu?: boolean;
  menuItems?: (item: T) => any[];
  onCardClick?: (item: T) => void;
}

const props = withDefaults(defineProps<Props>(), {
  showMenu: true,
  menuItems: undefined,
  onCardClick: undefined,
});

const { t } = useI18n();
const router = useRouter();
const menuRefs = ref<Record<string, any>>({});
const activeMenuKey = ref<string | null>(null);

const handleCardClick = (item: T) => {
  if (props.onCardClick) {
    props.onCardClick(item);
  } else {
    router.push(`/pages/library/detail/${item.id}/${item.contentType}`);
  }
};

const getImageUrl = (item: T) => {
  if (item.files && item.files.length > 0) {
    if (item.files[0].type === 2) return VideoFadeIcon;
    else if (item.files[0].type === 1) return ImageFadeIcon;
    else return FileFadeIcon;
  }
  return "";
};

const getContentInfo = (contentType: number, isTitle: boolean = false) => {
  if (contentType === 4)
    return isTitle ? t("Academy.library.exercises") : ExerciseIcon;
  else if (contentType === 1)
    return isTitle ? t("Academy.library.skills") : SkillIcon;
  else if (contentType === 2)
    return isTitle ? t("Academy.library.articles") : ArticleIcon;
  else if (contentType === 3)
    return isTitle ? t("Academy.library.guides") : GuideIcon;
  else if (contentType === 5)
    return isTitle ? t("Academy.library.courses") : CourseIcon;
  else if (contentType === 6)
    return isTitle ? t("Academy.library.misc") : MiscIcon;
  else return isTitle ? "" : "";
};

const computedMenuItems = (item: T) => {
  if (props.menuItems) {
    return props.menuItems(item);
  }
  return [];
};

const setMenuRef = (key: string) => (el: any) => {
  if (el) {
    menuRefs.value[key] = el;
  }
};

const toggleMenu = (event: Event, key: string) => {
  const menu = menuRefs.value[key];
  if (menu && menu.toggle) {
    activeMenuKey.value = key;
    menu.toggle(event);
  }
};
</script>
