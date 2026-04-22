<template>
  <form
    @submit.prevent="
      editingIndex !== null ? saveEditingDocument() : handleNext()
    "
    class="flex flex-col gap-2"
  >
    <div
      class="flex items-center"
      :class="isEditMode ? 'justify-end' : 'justify-between'"
    >
      <span v-if="!isEditMode" class="font-semibold text-lg">{{
        !showPreview && editingIndex === null
          ? t("Clubs.contractDocs.formTitle")
          : editingIndex !== null
            ? t("Clubs.contractDocs.editDocument")
            : t("Clubs.contractDocs.previewTitle")
      }}</span>

      <Button
        :label="t('Clubs.contractDocs.addDoc')"
        icon="pi pi-plus-circle"
        severity="primary"
        rounded
        @click="addDocument"
      />
    </div>

    <div v-if="!showPreview">
      <div v-if="editingDocument" class="flex flex-col gap-6 mt-3">
        <div class="relative p-6 border rounded-3xl">
          <ContractDocForm
            ref="editingDocumentFormRef"
            :initial-document="editingDocument"
            :show-delete="false"
            @save="updateEditingDocument"
          />
        </div>
      </div>

      <div v-else-if="documents.length > 0" class="flex flex-col gap-6 mt-3">
        <div
          v-for="(doc, index) in documents"
          :key="doc.uniqueId || `doc-${index}`"
          class="flex flex-col gap-4"
        >
          <div v-if="documents.length > 1" class="font-semibold text-stroke">
            {{ t("Clubs.contractDocs.document") }} {{ index + 1 }}
          </div>
          <div class="relative p-6 border rounded-3xl">
            <ContractDocForm
              :ref="(el) => setDocumentFormRef(el, index)"
              :initial-document="doc"
              :show-delete="documents.length > 1"
              @save="(updatedDoc) => saveDocument(index, updatedDoc)"
              @remove="removeDocument(index)"
            />
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl mt-3"
      >
        <i class="pi pi-file text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-500 mb-4">
          {{ t("Clubs.contractDocs.noDocuments") }}
        </p>
        <Button
          :label="t('Clubs.contractDocs.addDoc')"
          icon="pi pi-plus-circle"
          severity="primary"
          @click="addDocument"
        />
      </div>
    </div>

    <div v-else class="mt-3">
      <div
        v-if="documents.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="(doc, index) in documents"
          :key="doc.uniqueId || `doc-preview-${index}`"
          class="border rounded-2xl p-4"
        >
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-end">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-trash"
                  severity="secondary"
                  size="small"
                  text
                  rounded
                  @click="removeDocument(index)"
                />
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  size="small"
                  text
                  rounded
                  @click="editDocument(index)"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="font-semibold text-primary font-inter h-10">
                {{ getCategoryLabel(doc.documentCategory) }}
              </div>
              <div class="text-xs">
                <div class="text-secondary-color" v-if="doc.endDate">
                  🗓️ valid till {{ formatDate(doc.endDate.toISOString(), t) }}
                </div>
                <div
                  class="text-secondary-color font-semibold"
                  v-if="doc.price"
                >
                  €: {{ doc.price }}
                </div>
                <span
                  class="text-primary leading-tight line-clamp-2 wrap-break-word"
                  v-if="doc.file"
                >
                  {{ doc.file.name }}
                </span>
                <span
                  v-else-if="doc.documentUrl"
                  class="text-primary leading-tight line-clamp-2 wrap-break-word hover:underline"
                  @click="openDocument(doc.documentUrl)"
                  >{{
                    doc.documentName || t("Clubs.contractDocs.viewDocument")
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        !isEditMode ||
        editingIndex !== null ||
        (!showPreview && documents.length > 0)
      "
      class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
    >
      <div v-if="!isEditMode" class="flex justify-end gap-2">
        <Button
          :label="editingIndex !== null ? t('app.cancel') : t('app.skip')"
          fluid
          severity="secondary"
          @click="editingIndex !== null ? cancelEdit() : handleSkip()"
        />
        <Button
          :label="
            editingIndex !== null
              ? t('app.update')
              : showPreview
                ? t('app.complete')
                : t('app.next')
          "
          fluid
          type="submit"
        />
      </div>
      <div v-else class="flex justify-end gap-2">
        <Button
          v-if="editingIndex !== null"
          :label="t('app.cancel')"
          fluid
          severity="secondary"
          @click="cancelEdit()"
        />
        <Button
          :label="editingIndex !== null ? t('app.update') : t('app.save')"
          fluid
          variant="outlined"
          type="submit"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { ContractDocument } from "@/types/common";
import ContractDocForm from "@/components/ContractDocForm.vue";
import { formatDate, generateUniqueId, openDocument } from "@/utils/helpers";
import {
  getDocumentCategoryOptions,
  getLabelByValue,
} from "@/constants/formOptions";

interface Props {
  documents?: ContractDocument[];
  isEditMode?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:documents", documents: ContractDocument[]): void;
  (e: "next"): void;
}>();

const { t } = useI18n();

const showPreview = ref(false);
const editingIndex = ref<number | null>(null);
const editingDocument = ref<ContractDocument | null>(null);

const documentFormRefs = ref<any[]>([]);
const editingDocumentFormRef = ref<any>(null);

const setDocumentFormRef = (el: any, index: number) => {
  if (el) {
    documentFormRefs.value[index] = el;
  }
};

const defaultDocument: ContractDocument = {
  uniqueId: generateUniqueId("document"),
  documentCategory: "",
  file: null,
  startDate: null,
  endDate: null,
  autoRenewal: false,
  autoRenewalTill: undefined,
  numberOfMembers: undefined,
  price: 0,
};

const getInitialDocuments = (): ContractDocument[] => {
  if (props.documents && props.documents.length > 0) {
    const docsWithIds = props.documents.map((doc) => ({
      ...doc,
      uniqueId: doc.uniqueId || generateUniqueId("document"),
    }));
    if (props.isEditMode) {
      showPreview.value = true;
    }
    return docsWithIds;
  }
  return props.isEditMode
    ? []
    : [{ ...defaultDocument, uniqueId: generateUniqueId("document") }];
};

const documents = ref<ContractDocument[]>(getInitialDocuments());

watch(
  () => props.documents,
  (newDocuments) => {
    if (newDocuments && newDocuments.length > 0) {
      documents.value = newDocuments.map((doc) => ({
        ...doc,
        uniqueId: doc.uniqueId || generateUniqueId("document"),
      }));
      if (props.isEditMode) {
        showPreview.value = true;
      }
    } else if (newDocuments && newDocuments.length === 0) {
      documents.value = [];
      showPreview.value = false;
    }
  },
  { deep: true },
);

const documentCategoryOptions = computed(() => getDocumentCategoryOptions(t));

const getCategoryLabel = (documentCategory: string) =>
  getLabelByValue(documentCategoryOptions.value, documentCategory);

const addDocument = () => {
  showPreview.value = false;
  editingIndex.value = null;
  editingDocument.value = null;
  documents.value.push({
    ...defaultDocument,
    uniqueId: generateUniqueId("document"),
  });
};

const emitDocumentsUpdate = () => {
  emit("update:documents", documents.value);
};

const saveDocument = (index: number, updatedDocument: ContractDocument) => {
  documents.value[index] = { ...updatedDocument };
};

const removeDocument = (index: number) => {
  documents.value.splice(index, 1);
  documentFormRefs.value.splice(index, 1);

  if (documents.value.length === 0) showPreview.value = false;
  if (editingIndex.value === index) {
    editingDocument.value = null;
    editingIndex.value = null;
  } else if (editingIndex.value !== null && editingIndex.value > index) {
    editingIndex.value--;
  }

  emitDocumentsUpdate();
};

const editDocument = (index: number) => {
  showPreview.value = false;
  editingIndex.value = index;
  editingDocument.value = { ...documents.value[index] };
};

const updateEditingDocument = (updatedDocument: ContractDocument) => {
  editingDocument.value = updatedDocument;
};

const resetEditingState = () => {
  editingDocument.value = null;
  editingIndex.value = null;
  if (props.isEditMode) showPreview.value = true;
};

const saveEditingDocument = async () => {
  if (!editingDocument.value || editingIndex.value === null) return;

  const result = await editingDocumentFormRef.value?.validate();
  if (!result?.valid) return;

  documents.value[editingIndex.value] = { ...editingDocument.value };
  resetEditingState();
  emitDocumentsUpdate();
};

const cancelEdit = () => {
  resetEditingState();
};

const handleSkip = () => {
  emit("next");
};

const handleNext = async () => {
  if (!showPreview.value && documents.value.length > 0) {
    const isValid = await validateAllDocuments();
    if (!isValid) return;

    showPreview.value = true;
    emitDocumentsUpdate();
    return;
  }

  emitDocumentsUpdate();
  emit("next");
};

const validateAllDocuments = async () => {
  const validationResults = await Promise.all(
    documentFormRefs.value.map((formRef) => formRef?.validate()),
  );
  return validationResults.every((result) => result?.valid);
};
</script>
