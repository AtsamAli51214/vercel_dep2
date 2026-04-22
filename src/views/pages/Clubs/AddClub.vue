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
              t(`Clubs.createClubTitle${activeStep}`)
            }}</span>
            <span class="font-medium text-secondary-color text-xs">
              {{ t(`Clubs.createClubDescription${activeStep}`) }}
            </span>
          </div>

          <span class="text-stroke text-4xl font-semibold md:pl-6"
            >{{ activeStep }}/3</span
          >
        </div>

        <Stepper v-model:value="activeStep">
          <StepPanels
            :pt="{
              root: {
                class: '!pl-0',
              },
            }"
          >
            <StepPanel v-slot="{ activateCallback }" :value="1">
              <ClubDetails
                ref="clubDetailsRef"
                :initialData="collectedData.clubDetails"
                @validated="handleClubDetailsValidated($event)"
                @next="handleNext(1, activateCallback)"
              />
            </StepPanel>
            <StepPanel v-slot="{ activateCallback }" :value="2">
              <ContactInfo
                ref="contactInfoRef"
                :contacts="collectedData.Contacts"
                :default-country="collectedData.clubDetails?.Country"
                :activateCallback="activateCallback"
                @update:contacts="handleContactsUpdated"
                @next="handleNext(2, activateCallback)"
              />
            </StepPanel>
            <StepPanel v-slot :value="3">
              <ContractDocs
                :documents="collectedData.Contracts"
                @update:documents="handleContractDocsUpdated"
                @next="handleFinalSubmit"
              />
            </StepPanel>
          </StepPanels>
        </Stepper>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
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
import { buildClubFormData } from "@/utils/clubMappers";

const { t } = useI18n();
const router = useRouter();
const loader = useAppLoader();
const dialog = useGlobalDialog();

const activeStep = ref<number>(1);

const collectedData = ref<{
  clubDetails?: ClubDetailsFormData;
  Contacts?: ClubContactApiFormat[];
  Contracts?: ContractDocument[];
}>({});

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

const handleNext = async (
  currentStep: number,
  activateCallback: (step: number) => void,
) => {
  const isValid =
    currentStep === 1 ? await clubDetailsRef.value?.validate() : true;

  if (isValid) {
    activateCallback(currentStep + 1);
  }
};

const handleFinalSubmit = async () => {
  loader.setLoading(true, t("loading.creatingClub"));

  try {
    const formData = buildClubFormData(
      collectedData.value.clubDetails,
      collectedData.value.Contacts,
      collectedData.value.Contracts,
    );

    const result = await clubService.createClub(formData);

    if (result.success) {
      router.push({ name: "club" });
    } else
      dialog.showError(
        t("validation.unableToDelete.title"),
        result.error,
        t("app.ok"),
      );
  } finally {
    loader.setLoading(false);
  }
};

const goBack = () => {
  activeStep.value > 1 ? activeStep.value-- : router.back();
};
</script>

<style scoped></style>
