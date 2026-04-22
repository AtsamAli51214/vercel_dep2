<template>
  <div class="flex justify-center gap-6">
    <div class="bg-white rounded-2xl p-6 md:p-15 w-232 relative">
      <div
        @click="goBack"
        class="absolute mt-2 transition-opacity cursor-pointer left-2 md:left-10 hover:opacity-80"
      >
        <img :src="BackArrow" alt="back" />
      </div>
      <div class="flex flex-col gap-6">
        <div class="flex items-start justify-between md:items-center">
          <div class="flex flex-col">
            <span class="font-bold text-3xl text-primary">{{
              t("Clubs.editClubTitle")
            }}</span>
            <span class="font-medium text-secondary-color text-xs">
              {{ t("Clubs.editClubDescription") }}
            </span>
          </div>
        </div>

        <Accordion
          :value="activeAccordion"
          :pt="{
            AccordionPanel: {
              class: '!border-none !bg-red-500',
            },
            AccordionContent: {
              class: '!p-0',
            },
          }"
        >
          <AccordionPanel value="0">
            <AccordionHeader>
              <span class="font-semibold text-lg">{{
                t("Clubs.sections.clubDetails")
              }}</span>
            </AccordionHeader>
            <AccordionContent>
              <ClubDetails
                ref="clubDetailsRef"
                :initialData="collectedData.clubDetails"
                :isEditMode="isEditMode"
                @validated="handleClubDetailsValidated($event)"
              />
            </AccordionContent>
          </AccordionPanel>

          <AccordionPanel value="1">
            <AccordionHeader>
              <span class="font-semibold text-lg">{{
                t("Clubs.contactInfo.formTitle")
              }}</span>
            </AccordionHeader>
            <AccordionContent>
              <ContactInfo
                ref="contactInfoRef"
                :contacts="collectedData.Contacts || []"
                :default-country="collectedData.clubDetails?.Country"
                :isEditMode="isEditMode"
                @update:contacts="handleContactsUpdated"
              />
            </AccordionContent>
          </AccordionPanel>

          <AccordionPanel value="2">
            <AccordionHeader>
              <span class="font-semibold text-lg">{{
                t("Clubs.contractDocs.formTitle")
              }}</span>
            </AccordionHeader>
            <AccordionContent>
              <ContractDocs
                ref="contractDocsRef"
                :documents="collectedData.Contracts || []"
                :isEditMode="isEditMode"
                @update:documents="handleContractDocsUpdated"
              />
            </AccordionContent>
          </AccordionPanel>
        </Accordion>

        <div class="flex md:w-1/2 gap-4 mt-6">
          <Button
            :label="t('app.update')"
            @click="handleFinalSubmit"
            fluid
            :loading="isSaving"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { BackArrow } from "@/assets/images";
import type {
  ContractDocument,
  ClubDetailsFormData,
  ClubContactApiFormat,
} from "@/types";
import { useAppLoader, useGlobalDialog } from "@/composables";
import { clubService } from "@/services";
import { ClubDetails, ContactInfo, ContractDocs } from "./Steps";
import { AccordionPanel } from "primevue";
import { mapApiClubToFormData, buildClubFormData } from "@/utils/clubMappers";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const loader = useAppLoader();
const dialog = useGlobalDialog();

const isEditMode = computed(() => !!route.params.id);
const clubId = computed(() => route.params.id as string | undefined);

const activeAccordion = ref<string>("0");
const isSaving = ref(false);

const collectedData = ref<{
  clubDetails?: ClubDetailsFormData;
  Contacts?: ClubContactApiFormat[];
  Contracts?: ContractDocument[];
}>({});

const fetchClubData = async () => {
  if (!clubId.value) return;

  try {
    const result = await clubService.getClubById(clubId.value);

    if (result.success && result.data) {
      const { clubDetails, contacts, contracts } = mapApiClubToFormData(
        result.data,
      );

      collectedData.value.clubDetails = clubDetails;
      collectedData.value.Contacts = contacts;
      collectedData.value.Contracts = contracts;
    }
  } catch (error) {
    console.error("Error fetching club:", error);
  }
};

onMounted(async () => {
  if (route.params.id) {
    await fetchClubData();
  }
});

const clubDetailsRef = ref<InstanceType<typeof ClubDetails> | null>(null);

const handleClubDetailsValidated = (data: ClubDetailsFormData) => {
  collectedData.value.clubDetails = data;
};

const handleContactsUpdated = (contacts: ClubContactApiFormat[]) => {
  collectedData.value.Contacts = contacts;
};

const handleContractDocsUpdated = (documents: ContractDocument[]) => {
  collectedData.value.Contracts = documents;
};

const handleFinalSubmit = async () => {
  const clubDetailsValid = await clubDetailsRef.value?.validate();

  if (!clubDetailsValid) {
    activeAccordion.value = "0";
    return;
  }

  isSaving.value = true;
  loader.setLoading(true, t("loading.updatingClub"));

  try {
    const formData = buildClubFormData(
      collectedData.value.clubDetails,
      collectedData.value.Contacts,
      collectedData.value.Contracts,
    );

    const result = await clubService.updateClub(formData);

    if (result.success) {
      router.push({ name: "club" });
    } else {
      dialog.showError(
        t("validation.unableToDelete.title"),
        result.error,
        t("app.ok"),
      );
    }
  } finally {
    isSaving.value = false;
    loader.setLoading(false);
  }
};

const goBack = () => router.push({ name: "club" });
</script>

<style scoped></style>
