export const USER_INITIAL_VALUES = {
  logoFile: undefined,
  fullName: "",
  email: "",
  phoneNumber: "",
  gender: "",
  clubRoles: [
    {
      clubId: null,
      ageUserId: null,
      teamId: null,
      roles: [],
    },
  ],
};

export const FORM_CONFIG = {
  image: {
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxSize: 5,
    minSize: 1,
    validateDimensions: false,
  },
  phone: {
    maxLength: 12,
  },
};
