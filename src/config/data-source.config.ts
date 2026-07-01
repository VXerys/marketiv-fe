export const DATA_SOURCE_CONFIG = {
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === undefined,
} as const;
