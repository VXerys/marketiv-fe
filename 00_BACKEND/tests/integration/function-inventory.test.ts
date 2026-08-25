import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const backendDir = path.resolve(import.meta.dirname, "../..");

describe("function inventory audit", () => {
  it("passes when functions directory, generator, scopes, and config stay in sync", () => {
    const result = spawnSync(
      process.execPath,
      ["appwrite/ops/audit-function-inventory.mjs"],
      {
        cwd: backendDir,
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("STATUS: PASS");
  });

  it("keeps reset-password-with-otp scopes aligned across source and generated config", () => {
    const functionScopes = JSON.parse(
      fs.readFileSync(path.join(backendDir, "appwrite/function-scopes.json"), "utf8"),
    );
    const appwriteConfig = JSON.parse(
      fs.readFileSync(path.join(backendDir, "appwrite.config.json"), "utf8"),
    );
    const expectedScopes = ["users.read", "users.write", "sessions.write"];
    const configFunction = appwriteConfig.functions.find(
      (fn: { $id: string; scopes: string[] }) => fn.$id === "reset-password-with-otp",
    );

    expect(functionScopes["reset-password-with-otp"]).toEqual(expectedScopes);
    expect(configFunction?.scopes).toEqual(expectedScopes);
  });

  it("keeps retired legacy money functions disabled while Midtrans payments stay active", () => {
    const appwriteConfig = JSON.parse(
      fs.readFileSync(path.join(backendDir, "appwrite.config.json"), "utf8"),
    );
    const functionById = new Map(
      appwriteConfig.functions.map((fn: { $id: string }) => [fn.$id, fn]),
    );

    expect(functionById.get("mature-pending-balance")).toMatchObject({
      enabled: false,
      schedule: "",
      execute: [],
    });
    expect(functionById.get("withdrawal-callback")).toMatchObject({
      enabled: false,
      schedule: "",
      execute: [],
    });
    expect(functionById.get("midtrans-webhook")).toMatchObject({
      enabled: true,
      schedule: "",
      execute: ["any"],
    });
  });
});
