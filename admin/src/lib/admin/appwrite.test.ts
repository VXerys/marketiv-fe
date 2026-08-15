import { afterEach, describe, expect, it, vi } from "vitest";

const requiredEnv = {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: "https://api.example.test/v1",
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: "project-test",
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: "database-test",
};

async function loadAppwriteConfig() {
  vi.resetModules();
  return import("./appwrite");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Admin Appwrite configuration", () => {
  it("fails explicitly when a required value is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT", "");
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID", requiredEnv.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_DATABASE_ID", requiredEnv.NEXT_PUBLIC_APPWRITE_DATABASE_ID);

    await expect(loadAppwriteConfig()).rejects.toThrow(
      "NEXT_PUBLIC_APPWRITE_ENDPOINT is required",
    );
  });

  it("fails explicitly when the endpoint protocol is invalid", async () => {
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT", "ftp://api.example.test/v1");
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID", requiredEnv.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_DATABASE_ID", requiredEnv.NEXT_PUBLIC_APPWRITE_DATABASE_ID);

    await expect(loadAppwriteConfig()).rejects.toThrow(
      "NEXT_PUBLIC_APPWRITE_ENDPOINT must be a valid http(s) URL",
    );
  });

  it("uses only explicit valid values", async () => {
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT", requiredEnv.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID", requiredEnv.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_DATABASE_ID", requiredEnv.NEXT_PUBLIC_APPWRITE_DATABASE_ID);

    await expect(loadAppwriteConfig()).resolves.toMatchObject({
      databaseId: requiredEnv.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    });
  });
});
