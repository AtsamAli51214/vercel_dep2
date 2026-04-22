<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col">
      <span class="font-bold text-2xl text-primary">{{
        t("Academy.library.moduleForm.addModule")
      }}</span>
      <span class="font-medium text-secondary-color text-xs">
        {{ t("Academy.library.moduleForm.description") }}
      </span>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <span class="font-semibold text-lg">{{
          t("Academy.library.moduleForm.infoTitle")
        }}</span>

        <Button
          v-if="!isEditingSingleModule && localModules.length > 0"
          :label="t('Academy.library.moduleForm.addModule')"
          @click="
            confirmDiscardChanges($event, () => {
              activeModule = 'add';
            })
          "
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <AddModule
        v-if="activeModule !== null"
        :key="`${activeModule === 'add' ? 'add' : `edit-${activeModule}`}-${formKey}`"
        :class="isEditingSingleModule ? '' : 'border rounded-xl p-4'"
        :moduleData="editingModuleData"
        :courseId="courseId"
        @moduleSaved="handleModuleSaved"
        @cancel="handleCancelForm"
        @formChanged="hasUnsavedChanges = $event"
      />

      <div
        v-for="(module, index) in localModules"
        :key="module.uniqueId"
        v-if="!isEditingSingleModule"
      >
        <div
          class="flex justify-between items-center border-b py-1"
          v-if="activeModule !== index"
        >
          <div class="flex items-center gap-2">
            <img :src="ModulePrimaryIcon" alt="Module Icon" class="w-6 h-6" />
            <div class="flex flex-col">
              <span class="font-semibold text-lg text-primary">
                {{ module.title }}
              </span>
              <span
                v-if="module.description"
                class="text-xs text-secondary-color"
              >
                {{ module.description }}
              </span>
            </div>
          </div>
          <div class="flex">
            <Button
              @click="
                confirmDiscardChanges($event, () => {
                  activeModule = index;
                })
              "
              icon="pi pi-pencil"
              variant="text"
              size="small"
            />
            <Button
              icon="pi pi-trash"
              @click="
                confirmDiscardChanges($event, () => {
                  handleDelete(index);
                })
              "
              severity="danger"
              variant="text"
              size="small"
            />
          </div>
        </div>
      </div>

      <div
        v-if="
          localModules.length === 0 &&
          activeModule !== 'add' &&
          !isEditingSingleModule
        "
        class="text-center py-8 border border-dashed rounded-lg p-4"
      >
        <p class="text-lg font-semibold">
          {{ t("Academy.library.moduleForm.noModulesAdded") }}
        </p>
        <Button
          :label="t('Academy.library.moduleForm.addModule')"
          @click="
            confirmDiscardChanges($event, () => {
              activeModule = 'add';
            })
          "
          icon="pi pi-plus-circle"
          class="mt-2"
          outlined
          rounded
        />
      </div>
    </div>

    <div class="flex gap-2 w-1/2" v-if="!isEditingSingleModule">
      <Button
        :label="t('Academy.library.courseContent.saveToCourse')"
        :disabled="saveDisabled"
        @click="handleSaveModules"
        severity="primary"
        class="w-1/2"
      />
    </div>

    <ConfirmPopover
      ref="confirmPopoverRef"
      group="moduleDiscard"
      @accept="handleConfirmAccept"
      @reject="handleConfirmReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AddModule from "./AddModule.vue";
import ConfirmPopover from "@/components/Dialogs/ConfirmPopover.vue";
import type { ModuleData } from "./types";
import { ModulePrimaryIcon, WarningIcon } from "@/assets/images";
import { generateUniqueId } from "@/utils/helpers";
import { libraryService } from "@/services";
import { useAppLoader, useContentCache } from "@/composables";

interface Props {
  moduleData?: ModuleData;
  courseId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  moduleData: undefined,
  courseId: undefined,
  modules: () => [],
});

const emit = defineEmits<{
  refresh: [];
  cancelEdit: [];
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const loader = useAppLoader();
const { invalidateContent } = useContentCache();
const confirmPopoverRef = ref();

function modulesListSignature(mods: ModuleData[]): string {
  return JSON.stringify(
    mods.map((m) => ({
      id: m.id ?? null,
      title: m.title,
      description: m.description ?? "",
    })),
  );
}

const localModules = ref<ModuleData[]>([]);
const activeModule = ref<"add" | number | null>(null);
const hasUnsavedChanges = ref(false);
const formKey = ref(0);
const baselineModulesSignature = ref(modulesListSignature([]));

const isEditingSingleModule = computed(() => !!props.moduleData);

const isListDirty = computed(
  () =>
    modulesListSignature(localModules.value) !== baselineModulesSignature.value,
);

/** Batch save only when no inline add/edit form is open (finish or cancel first). */
const isListModuleFormOpen = computed(
  () => !isEditingSingleModule.value && activeModule.value !== null,
);

const saveDisabled = computed(() => {
  if (isListModuleFormOpen.value) return true;
  return localModules.value.length === 0 || (!hasUnsavedChanges.value && !isListDirty.value);
});

const editingModuleData = computed(() => {
  if (isEditingSingleModule.value) {
    return props.moduleData;
  }

  if (activeModule.value === "add") {
    return undefined;
  }
  if (typeof activeModule.value === "number") {
    return localModules.value[activeModule.value];
  }
  return undefined;
});

if (props.moduleData) {
  activeModule.value = 0;
} else {
  activeModule.value = "add";
}

const pendingAction = ref<(() => void) | null>(null);

const confirmDiscardChanges = (event: Event, onAccept: () => void) => {
  if (!hasUnsavedChanges.value) {
    onAccept();
    return;
  }

  pendingAction.value = onAccept;

  confirmPopoverRef.value?.showConfirm({
    target: event.currentTarget as HTMLElement,
    message: t("validation.confirmDiscardChanges"),
    customIcon: WarningIcon,
    acceptLabel: t("app.yes"),
    rejectLabel: t("app.no"),
    severity: "primary",
  });
};

const handleConfirmAccept = () => {
  if (pendingAction.value) {
    hasUnsavedChanges.value = false;

    formKey.value++;

    pendingAction.value();
    pendingAction.value = null;
  }
};

const handleConfirmReject = () => {
  pendingAction.value = null;
};

const handleCancelForm = () => {
  hasUnsavedChanges.value = false;
  activeModule.value = null;
  formKey.value++;

  if (isEditingSingleModule.value) {
    emit("cancelEdit");
  }
};

const handleModuleSaved = async (module: ModuleData) => {
  if (isEditingSingleModule.value) {
    try {
      loader.setLoading(true, t("loading.savingModules"));
      const response = await libraryService.createUpdateModule(
        props.courseId as number,
        [
          {
            moduleId: module.id,
            title: module.title,
            description: module.description || "",
          },
        ],
      );

      if (response.success) {
        hasUnsavedChanges.value = false;
        activeModule.value = null;
        formKey.value++;
        if (props.courseId) {
          invalidateContent(props.courseId);
        }

        if (
          route.name === "editcoursemodule" &&
          route.params.id &&
          route.params.type
        ) {
          await router.push({
            name: "contentdetail",
            params: {
              id: route.params.id,
              type: route.params.type,
            },
          });
        } else {
          emit("refresh");
        }
      }
    } catch (error) {
      console.error("Error saving module:", error);
    } finally {
      loader.setLoading(false);
    }
    return;
  }

  if (activeModule.value === "add") {
    const newModule = {
      ...module,
      uniqueId: generateUniqueId("module"),
    };
    localModules.value.push(newModule);
  } else if (typeof activeModule.value === "number") {
    const index = activeModule.value;
    localModules.value[index] = {
      ...localModules.value[index],
      ...module,
    };
  }

  hasUnsavedChanges.value = false;
  activeModule.value = null;
  formKey.value++;
};

const handleDelete = (index: number) => {
  localModules.value.splice(index, 1);
  if (activeModule.value === index) {
    activeModule.value = null;
    formKey.value++;
  } else if (
    typeof activeModule.value === "number" &&
    activeModule.value > index
  ) {
    activeModule.value--;
  }
};

const handleSaveModules = async () => {
  try {
    loader.setLoading(true, t("loading.savingModules"));
    const modulesToSave = localModules.value.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
    }));

    const response = await libraryService.createUpdateModule(
      props.courseId as number,
      modulesToSave,
    );
    if (response.success) {
      hasUnsavedChanges.value = false;
      activeModule.value = null;
      formKey.value++;
      baselineModulesSignature.value = modulesListSignature(localModules.value);
      if (props.courseId) {
        invalidateContent(props.courseId);
      }
      emit("refresh");
    }
  } finally {
    loader.setLoading(false);
  }
};
</script>

<style scoped></style>
