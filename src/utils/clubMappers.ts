import type {
  ClubContactApiFormat,
  ContractDocument,
  ContractDocumentApiFormat,
  ClubDetailsFormData,
} from "@/types";

export const mapApiContractToInternal = (contract: any): ContractDocument => ({
  id: contract.id || contract.Id,
  documentCategory: contract.documentCategory || "",
  file: null,
  documentUrl: contract.documentUrl || undefined,
  documentName: contract.documentName || undefined,
  startDate: contract.startDate ? new Date(contract.startDate) : null,
  endDate: contract.endDate ? new Date(contract.endDate) : null,
  autoRenewal: contract.autoRenewal || false,
  autoRenewalTill: contract.autoRenewalPeriod,
  numberOfMembers: contract.numberOfMembers || undefined,
  price: contract.pricingModel || 0,
});

const mapContractToApiFormat = (
  document: ContractDocument,
): ContractDocumentApiFormat => {
  const requiresFields = ["Contract", "Offers"].includes(
    document.documentCategory,
  );

  const baseData: any = {
    ...(document.id !== undefined && { id: document.id }),
    ...(document.fileIndex !== undefined && { fileIndex: document.fileIndex }),
    documentCategory: document.documentCategory,
  };

  if (requiresFields) {
    baseData.startDate = document.startDate
      ? new Date(document.startDate).toISOString()
      : "";
    baseData.endDate = document.endDate
      ? new Date(document.endDate).toISOString()
      : "";
    baseData.autoRenewal = document.autoRenewal || false;
    baseData.pricingModel = document.price || 0;

    if (document.autoRenewal && document.autoRenewalTill) {
      baseData.autoRenewalPeriod = document.autoRenewalTill;
    }

    if (
      document.numberOfMembers !== undefined &&
      document.numberOfMembers !== null
    ) {
      baseData.numberOfMembers = document.numberOfMembers;
    }
  }

  return baseData as ContractDocumentApiFormat;
};

export const mapApiClubToFormData = (
  apiData: any,
): {
  clubDetails: ClubDetailsFormData;
  contacts: ClubContactApiFormat[];
  contracts: ContractDocument[];
} => {
  const clubDetails: ClubDetailsFormData = {
    Id: apiData.id,
    Logo: null,
    ClubName: apiData.name || apiData.Name || "",
    Country: apiData.country || apiData.Country || "",
    FederationId: apiData.federationId || 0,
    BondNumber: apiData.bondNumber || undefined,
    EmailOrMemberId: apiData.emailOrMemberId || apiData.email || "",
    SupplierId: apiData.supplierId || 0,
    LabelType: apiData.label || undefined,
    logoUrl: apiData.logoUrl || undefined,
  };

  const contacts: ClubContactApiFormat[] = Array.isArray(apiData.contacts)
    ? apiData.contacts.map((contact: any) => ({
        id: contact.id,
        name: contact.name || "",
        roleTypeId: contact.roleTypeId || contact.roleId || 0,
        email: contact.email || "",
        phone: contact.phone || "",
        isPrimary: contact.isPrimary || contact.isPrimaryContact || false,
        hasAdminAccess:
          contact.hasAdminAccess || contact.isAdminAccess || false,
      }))
    : [];

  const contracts: ContractDocument[] = Array.isArray(apiData.contracts)
    ? apiData.contracts.map(mapApiContractToInternal)
    : [];

  return { clubDetails, contacts, contracts };
};

export const buildClubFormData = (
  clubDetails?: ClubDetailsFormData,
  contacts?: ClubContactApiFormat[],
  contracts?: ContractDocument[],
): FormData => {
  const formData = new FormData();

  if (clubDetails) {
    const { Logo, isLogoUpdated, ...details } = clubDetails;

    if (Logo && (isLogoUpdated === undefined || isLogoUpdated === true)) {
      formData.append("Logo", Logo);
    }

    if (isLogoUpdated) formData.append("isLogoUpdate", String(isLogoUpdated));

    Object.entries(details).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== "logoUrl") {
        formData.append(key, String(value));
      }
    });
  }

  if (contacts?.length) {
    formData.append("Contacts", JSON.stringify(contacts));
  }

  if (contracts?.length) {
    let fileIndex = 0;
    const contractsWithFileIndex = contracts.map((doc) =>
      doc.file ? { ...doc, fileIndex: fileIndex++ } : doc,
    );

    formData.append(
      "Contracts",
      JSON.stringify(contractsWithFileIndex.map(mapContractToApiFormat)),
    );

    contractsWithFileIndex.forEach((doc) => {
      if (doc.file) formData.append("ContractFiles", doc.file);
    });
  }

  return formData;
};
