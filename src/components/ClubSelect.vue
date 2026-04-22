<template>
  <div class="">
    <div class="font-medium mb-2.5">{{ label }}</div>
    <Select
      :model-value="modelValue"
      @update:model-value="handleUpdate"
      :options="filteredClubOptions"
      optionLabel="name"
      optionGroupLabel="label"
      optionGroupChildren="items"
      optionValue="value"
      fluid
      filter
      @change="emit('change', $event.value)"
      :disabled="disabled"
      @filter="handleFilter"
      :placeholder="placeholder"
      :invalid="!!error"
      :pt="{
        optionGroup: {
          class: '!bg-[#F6F6F6]',
        },
        clearIcon: {
          class: 'cursor-pointer',
        },
      }"
    >
      <template #optiongroup="{ option }">
        <div
          class="flex items-center justify-between w-full cursor-pointer"
          @click.stop="toggleGroup(option.code)"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ getCountryFlag(option.code) }}</span>
            <div>{{ option.label }}</div>
          </div>
          <i
            class="transition-transform duration-200 pi"
            :class="
              isGroupExpanded(option.code) ? 'pi-angle-down ' : 'pi-angle-right'
            "
          ></i>
        </div>
      </template>
      <template #emptyfilter>
        <small class="p-invalid" v-if="searchError">
          {{ searchError }}
        </small>
        <span v-else>
          {{ t("validation.noResultsFound") }}
        </span>
      </template>
    </Select>
    <small class="p-invalid" v-if="error">
      {{ error }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { GroupedClubOption } from "@/types";

const { t } = useI18n();

interface Props {
  modelValue?: number | string;
  clubOptions: GroupedClubOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: "Club",
  placeholder: "Select a club",
});

const emit = defineEmits<{
  "update:modelValue": [value: number | string | undefined];
  change: [value: number | string | undefined];
}>();

const expandedGroups = ref<Set<string>>(new Set());
const searchError = ref<string>("");

const initializeGroups = () => {
  expandedGroups.value.clear();
  props.clubOptions.forEach((group) => {
    expandedGroups.value.add(group.code);
  });
};

onMounted(() => {
  initializeGroups();
});

watch(
  () => props.clubOptions,
  () => {
    initializeGroups();
  },
  { deep: true },
);

const toggleGroup = (code: string): void => {
  if (expandedGroups.value.has(code)) {
    expandedGroups.value.delete(code);
  } else {
    expandedGroups.value.add(code);
  }
};

const isGroupExpanded = (code: string): boolean => {
  return expandedGroups.value.has(code);
};

const filteredClubOptions = computed<GroupedClubOption[]>(() => {
  return props.clubOptions.map((group) => {
    if (isGroupExpanded(group.code)) {
      return group;
    } else {
      return {
        ...group,
        items: [],
      };
    }
  });
});

const getCountryFlag = (code: any) => {
  return code === "NL" ? "🇳🇱" : code == "BE" ? "🇧🇪" : "";
};

const handleUpdate = (value: number | string | undefined) => {
  emit("update:modelValue", value);
};

const allowedCharsRegex = /^[A-Za-z0-9éëïöüèáóàêîôû\s\-'.&,/()]+$/;

const handleFilter = (event: { value: string }) => {
  const input = event.value ?? "";
  const trimmed = input.trim();

  if (!trimmed) {
    searchError.value = t("validation.blankSearchNotAllowed");
    event.value = "";
    return;
  }

  if (!allowedCharsRegex.test(trimmed)) {
    searchError.value = t("validation.invalidSearchInput");
    event.value = "";
    return;
  }
  searchError.value = "";
};
</script>

<style scoped></style>
