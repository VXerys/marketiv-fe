/**
 * User Role Constants
 *
 * Matches the documented `role` enum in the `profiles` collection.
 * Source of truth: docs/marketiv-md/database/02-collections-schema.md
 */
export const USER_ROLES = {
  UMKM: "UMKM",
  KREATOR: "KREATOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
