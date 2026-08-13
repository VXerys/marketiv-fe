import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";

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
});
