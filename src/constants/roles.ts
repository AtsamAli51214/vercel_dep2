export const ROLES = {
  SUPER_ADMIN: "Admin",
  CLUB_ADMIN: "Club",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
