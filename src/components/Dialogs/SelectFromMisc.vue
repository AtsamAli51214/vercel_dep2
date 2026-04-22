<script setup lang="ts">
import { libraryService } from "@/services";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useGlobalDialog } from "@/composables";
import { Content } from "@/types";

interface Props {
  courseId?: number;
  multiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
});

const model = defineModel<boolean>();
const emit = defineEmits<{
  (e: "selectedItems", items: Content[]): void;
}>();

const { t } = useI18n();
const dialog = useGlobalDialog();

const miscData = ref<Content[]>([]);
const selectedItems = ref<Content[]>([]);
const search = ref("");
const pagination = ref({
  page: 1,
  count: 12,
  totalRecords: 2,
});

const isSelected = (item: Content) => {
  return selectedItems.value.some((selected) => selected.id === item.id);
};

const toggleSelection = (item: Content) => {
  if (props.multiple) {
    const index = selectedItems.value.findIndex(
      (selected) => selected.id === item.id,
    );
    if (index > -1) {
      selectedItems.value.splice(index, 1);
    } else {
      selectedItems.value.push(item);
    }
  } else {
    if (isSelected(item)) {
      selectedItems.value = [];
    } else {
      selectedItems.value = [item];
    }
  }
};

onMounted(async () => {
  await getMiscData();
});

const getMiscData = async () => {
  const response = await libraryService.getLibraryData({
    searchTerm: search.value,
    ...pagination.value,
    contentType: 6,
  });
  if (response.success) {
    const { data, pagination: paginationData } = response;
    miscData.value = data || [];
    pagination.value.totalRecords = paginationData.totalRecords;
  } else {
    dialog.showError(t("Academy.library.errorLoadingMisc"), response.error);
  }
};

const onPaginate = async (event: any) => {
  pagination.value.page = event.page + 1;
  pagination.value.count = event.rows;
  await getMiscData();
};

const handleSave = () => {
  emit("selectedItems", selectedItems.value);
  model.value = false;
};
</script>

<template>
  <Dialog
    v-model:visible="model"
    :style="{ width: '900px' }"
    :header="t('Academy.library.selectFromMisc.title')"
    modal
    class="p-fluid"
  >
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <span class="font-medium text-secondary-color">
          {{ t("Academy.library.selectFromMisc.description") }}
        </span>
        <span v-if="selectedItems.length > 0 && multiple">
          {{
            t("Academy.library.selectFromMisc.itemSelected", {
              count: selectedItems.length,
            })
          }}
        </span>
      </div>
      <div class="flex justify-between items-center">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="search"
            :placeholder="t('forms.search')"
            :pt="{
              root: {
                class: '!rounded-full',
              },
            }"
            @keyup.enter="getMiscData"
          />
        </IconField>
        <Button
          :label="t('Academy.library.selectFromMisc.addSelected')"
          @click="handleSave"
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="item in miscData"
          :key="item.id"
          class="flex flex-col border rounded-xl p-4 hover:border-primary cursor-pointer transition-all relative"
          :class="{
            'border-primary bg-primary-50': isSelected(item),
            'border-stroke': !isSelected(item),
          }"
          @click="toggleSelection(item)"
        >
          <img
            :src="
              item.thumbnailUrl +
              (item.thumbnailUrl.includes('imgix.net') ? '?auto=format' : '')
            "
            class="h-24 object-fit rounded-xl"
          />
          <span class="font-semibold text-primary leading-6 truncate mt-2">{{
            item.title
          }}</span>
        </div>
      </div>

      <div
        v-if="miscData?.length === 0"
        class="h-120 flex flex-col gap-9 items-center justify-center"
      >
        <span class="text-2xl font-semibold">
          {{ t("Academy.library.selectFromMisc.noMiscData") }}
        </span>
      </div>
      <div v-else class="flex justify-end">
        <Paginator
          :rows="pagination.count"
          :totalRecords="pagination.totalRecords"
          template="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          :pageLinkSize="3"
          @page="onPaginate"
          size="small"
          :pt="{
            root: {
              class: '!bg-transparent !p-0 ',
            },
            pcRowPerPageDropdown: {
              class: '!text-xs',
            },
          }"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped></style>
