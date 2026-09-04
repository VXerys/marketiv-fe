import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

const backendDir = path.resolve(import.meta.dirname, "../..");

describe("function inventory audit", () => {
  it("keeps participant archive columns and legacy compatibility in generated schema", () => {
    const generator = fs.readFileSync(
      path.join(backendDir, "appwrite/generate_appwrite_json.cjs"),
      "utf8",
    );
    const appwriteConfig = JSON.parse(
      fs.readFileSync(path.join(backendDir, "appwrite.config.json"), "utf8"),
    );
    const conversations = appwriteConfig.tables.find(
      (table: { $id: string }) => table.$id === "conversations",
    );
    const columns = new Map(
      conversations?.columns.map((column: { key: string }) => [column.key, column]),
    );

    expect(conversations?.$permissions).toEqual(['create("users")']);
    expect(generator).toContain('createBoolAttr("umkm_archived", false, false)');
    expect(generator).toContain('createBoolAttr("creator_archived", false, false)');
    expect(columns.get("umkm_archived")).toMatchObject({
      type: "boolean",
      required: false,
      default: false,
    });
    expect(columns.get("creator_archived")).toMatchObject({
      type: "boolean",
      required: false,
      default: false,
    });
    expect(columns.get("is_archived")).toMatchObject({
      type: "boolean",
      required: false,
      default: false,
    });
  });

  it("loads shared ESM from Appwrite's CommonJS runtime package scope", () => {
    const appwriteConfig = JSON.parse(
      fs.readFileSync(path.join(backendDir, "appwrite.config.json"), "utf8"),
    );
    const runtimeDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "marketiv-appwrite-runtime-"),
    );

    try {
      fs.writeFileSync(
        path.join(runtimeDir, "package.json"),
        JSON.stringify({ type: "commonjs" }),
      );

      const functionRoot = path.join(runtimeDir, "src/function");
      fs.mkdirSync(functionRoot, { recursive: true });
      fs.cpSync(
        path.join(backendDir, "functions/_shared"),
        path.join(functionRoot, "_shared"),
        { recursive: true },
      );

      for (const functionId of ["create-conversation", "create-offer"]) {
        const configFunction = appwriteConfig.functions.find(
          (fn: { $id: string }) => fn.$id === functionId,
        );
        if (!configFunction) throw new Error(`Missing ${functionId} config`);
        expect(configFunction).toMatchObject({
          runtime: "node-22",
          path: "functions",
          entrypoint: `${functionId}/src/main.js`,
          commands: `cd ${functionId} && npm install`,
        });

        const deployedFunctionDir = path.join(functionRoot, functionId);
        fs.mkdirSync(deployedFunctionDir, { recursive: true });
        fs.copyFileSync(
          path.join(backendDir, "functions", functionId, "package.json"),
          path.join(deployedFunctionDir, "package.json"),
        );
        fs.cpSync(
          path.join(backendDir, "functions", functionId, "src"),
          path.join(deployedFunctionDir, "src"),
          { recursive: true },
        );
        fs.symlinkSync(
          path.join(backendDir, "node_modules"),
          path.join(deployedFunctionDir, "node_modules"),
          "dir",
        );

        const entrypoint = path.join(functionRoot, configFunction.entrypoint);
        const result = spawnSync(
          process.execPath,
          ["-e", `require(${JSON.stringify(entrypoint)})`],
          { encoding: "utf8" },
        );

        expect(result.status, result.stderr).toBe(0);
      }
    } finally {
      fs.rmSync(runtimeDir, { recursive: true, force: true });
    }
  });

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

  it("registers trusted Rate Card deliverable submission and closes browser create", () => {
    const functionScopes = JSON.parse(
      fs.readFileSync(path.join(backendDir, "appwrite/function-scopes.json"), "utf8"),
    );
    const appwriteConfig = JSON.parse(
      fs.readFileSync(path.join(backendDir, "appwrite.config.json"), "utf8"),
    );
    const permissionHardener = fs.readFileSync(
      path.join(backendDir, "appwrite/ops/harden-permissions.mjs"),
      "utf8",
    );
    const submitFunction = appwriteConfig.functions.find(
      (fn: { $id: string }) => fn.$id === "submit-ratecard-deliverable",
    );
    const deliverables = appwriteConfig.tables.find(
      (table: { $id: string }) => table.$id === "deliverables",
    );

    expect(functionScopes["submit-ratecard-deliverable"]).toEqual([
      "documents.read",
      "documents.write",
    ]);
    expect(submitFunction).toMatchObject({
      execute: ["users"],
      path: "functions/submit-ratecard-deliverable",
      scopes: ["documents.read", "documents.write"],
    });
    expect(deliverables?.$permissions).toEqual([]);
    expect(permissionHardener).toMatch(
      /id:\s*"deliverables",\s*permissions:\s*\[\]/,
    );
  });

  it("registers synchronous revision command and retires revision event writer", () => {
    const functionScopes = JSON.parse(
      fs.readFileSync(path.join(backendDir, "appwrite/function-scopes.json"), "utf8"),
    );
    const appwriteConfig = JSON.parse(
      fs.readFileSync(path.join(backendDir, "appwrite.config.json"), "utf8"),
    );
    const permissionHardener = fs.readFileSync(
      path.join(backendDir, "appwrite/ops/harden-permissions.mjs"),
      "utf8",
    );
    const functionById = new Map(
      appwriteConfig.functions.map((fn: { $id: string }) => [fn.$id, fn]),
    );
    const revisions = appwriteConfig.tables.find(
      (table: { $id: string }) => table.$id === "revisions",
    );

    expect(functionScopes["request-ratecard-revision"]).toEqual([
      "documents.read",
      "documents.write",
    ]);
    expect(functionById.get("request-ratecard-revision")).toMatchObject({
      enabled: true,
      execute: ["users"],
      events: [],
      path: "functions/request-ratecard-revision",
      scopes: ["documents.read", "documents.write"],
    });
    expect(functionById.get("sync-order-revision")).toMatchObject({
      enabled: false,
      execute: [],
      events: [],
    });
    expect(revisions?.$permissions).toEqual([]);
    expect(permissionHardener).toMatch(
      /id:\s*"revisions",\s*permissions:\s*\[\]/,
    );
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
