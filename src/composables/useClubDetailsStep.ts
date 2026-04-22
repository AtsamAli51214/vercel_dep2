import { computed, ref, watch, toRefs } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createClubDetailsSchema } from "@/utils/validation";
import type { ClubDetailsFormData } from "@/types";
import { convertUrlToFile } from "@/utils/helpers";

interface ClubDetailsData {
  imageFile: File | null;
  name: string;
  country: string;
  federationId: number;
  email: string;
  supplierId: number;
  labelId?: number;
}

interface UseClubDetailsStepProps {
  initialData?: Partial<ClubDetailsFormData>;
  isEditMode?: boolean;
}

export const useClubDetailsStep = (props?: UseClubDetailsStepProps) => {
  const { t } = useI18n();

  const reactiveProps = props ? toRefs(props) : undefined;

  const schema = toTypedSchema(createClubDetailsSchema(t));

  const defaultInitialValues: ClubDetailsData = {
    imageFile: null,
    name: "",
    country: "",
    federationId: 0,
    email: "",
    supplierId: 0,
    labelId: undefined,
  };

  const getInitialValues = (
    initialData?: Partial<ClubDetailsFormData>
  ): ClubDetailsData => {
    if (!initialData) {
      return defaultInitialValues;
    }

    return {
      imageFile: initialData.Logo || null,
      name: initialData.ClubName || "",
      country: initialData.Country || "",
      federationId: initialData.FederationId || 0,
      email: initialData.EmailOrMemberId || "",
      supplierId: initialData.SupplierId || 0,
      labelId: initialData.LabelType || undefined,
    };
  };

  const { handleSubmit, defineField, errors, values, resetForm, setValues } =
    useForm({
      validationSchema: schema,
      initialValues: getInitialValues(props?.initialData),
      validateOnMount: false,
    });

  const [imageFile] = defineField("imageFile");
  const [name] = defineField("name");
  const [country] = defineField("country");
  const [federationId] = defineField("federationId");
  const [email] = defineField("email");
  const [supplierId] = defineField("supplierId");
  const [labelId] = defineField("labelId");

  const currentImageUrl = ref<string>(props?.initialData?.logoUrl || "");
  const loading = ref(false);
  const isLogoUpdatedRef = ref(false);
  const isSubmitting = ref(false);
  const initialLogoFileRef = ref<File | null>(null);

  watch(
    () => imageFile.value,
    (newFile) => {
      if (!props?.isEditMode) {
        isLogoUpdatedRef.value = false;
        return;
      }
      if (newFile instanceof File) {
        isLogoUpdatedRef.value = initialLogoFileRef.value
          ? newFile !== initialLogoFileRef.value
          : true;
      } else {
        isLogoUpdatedRef.value = initialLogoFileRef.value !== null;
      }
    }
  );

  if (reactiveProps?.initialData) {
    watch(
      reactiveProps.initialData,
      async (newInitialData) => {
        if (newInitialData) {
          const initialValues = {
            imageFile: newInitialData.Logo || null,
            name: newInitialData.ClubName || "",
            country: newInitialData.Country || "",
            federationId: newInitialData.FederationId || 0,
            email: newInitialData.EmailOrMemberId || "",
            supplierId: newInitialData.SupplierId || 0,
            labelId: newInitialData.LabelType || undefined,
          };

          if (
            newInitialData.logoUrl &&
            typeof newInitialData.logoUrl === "string"
          ) {
            const logoFile = await convertUrlToFile(
              newInitialData.logoUrl,
              "existing-logo.jpg"
            );
            if (logoFile) {
              initialValues.imageFile = logoFile;
            }
          }

          setValues(initialValues);

          if (newInitialData.logoUrl) {
            currentImageUrl.value = newInitialData.logoUrl;
          }

          initialLogoFileRef.value = initialValues.imageFile || null;
          isLogoUpdatedRef.value = false;
        }
      },
      { immediate: true, deep: true }
    );
  }

  const isEditMode = computed(() => props?.isEditMode || false);

  const imageFileError = computed(
    () => errors.value.imageFile as string | undefined
  );
  const nameError = computed(() => errors.value.name as string | undefined);
  const countryError = computed(
    () => errors.value.country as string | undefined
  );
  const federationIdError = computed(
    () => errors.value.federationId as string | undefined
  );
  const emailError = computed(() => errors.value.email as string | undefined);
  const supplierIdError = computed(
    () => errors.value.supplierId as string | undefined
  );
  const labelIdError = computed(
    () => errors.value.labelId as string | undefined
  );

  const validateAndGetData = handleSubmit(
    (validatedValues) => {
      const data = validatedValues as ClubDetailsData;
      return {
        success: true,
        data: {
          Id: props?.initialData?.Id || null,
          Logo: data.imageFile,
          ClubName: data.name,
          Country: data.country,
          FederationId: data.federationId,
          BondNumber: props?.initialData?.BondNumber,
          EmailOrMemberId: data.email,
          SupplierId: data.supplierId,
          LabelType: data.labelId,
          isLogoUpdated: isLogoUpdatedRef.value,
        },
      };
    },
    (validationErrors) => {
      console.error("Validation errors:", validationErrors);
      return {
        success: false,
        errors: validationErrors,
      };
    }
  );

  const getCurrentData = (): ClubDetailsData => {
    return {
      imageFile: (values.imageFile as File | null) || null,
      name: values.name || "",
      country: values.country || "",
      federationId: values.federationId || 0,
      email: values.email || "",
      supplierId: values.supplierId || 0,
      labelId: values.labelId || undefined,
    };
  };

  return {
    imageFile,
    name,
    country,
    federationId,
    email,
    supplierId,
    labelId,
    currentImageUrl,
    loading,
    isSubmitting,
    isEditMode,
    isLogoUpdatedRef,
    imageFileError,
    nameError,
    countryError,
    federationIdError,
    emailError,
    supplierIdError,
    labelIdError,
    validateAndGetData,
    getCurrentData,
    resetForm,
  };
};
