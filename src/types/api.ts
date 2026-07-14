/**
 * Generic API Response Types
 *
 * Shared wrappers for Server Action and API Route responses.
 * Use these to keep response shapes consistent across the app.
 */

/** Successful API response with typed payload. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** API error response with optional field-level validation errors. */
export interface ApiError {
  success: false;
  error: string;
  /** Optional map of field names to their validation error messages. */
  fieldErrors?: Record<string, string[]>;
}

/**
 * Discriminated union for all Server Action / API Route return types.
 * Use `if (result.success)` to narrow to `ApiSuccess<T>` or `ApiError`.
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
