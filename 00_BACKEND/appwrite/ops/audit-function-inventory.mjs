#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const backendRoot = path.resolve(import.meta.dirname, "../..");
const functionsRoot = path.join(backendRoot, "functions");
const generatorPath = path.join(backendRoot, "appwrite", "generate_appwrite_json.cjs");
const scopesPath = path.join(backendRoot, "appwrite", "function-scopes.json");
const configPath = path.join(backendRoot, "appwrite.config.json");
const requiredFunctionFiles = ["package.json", path.join("src", "main.js")];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sortUnique(values) {
  return [...new Set(values)].sort();
}

function findDuplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value, count]) => `${value} (${count}x)`)
    .sort();
}

function diff(left, right) {
  return left.filter((value) => !right.includes(value)).sort();
}

function validFunctionDirs() {
  return fs
    .readdirSync(functionsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .filter((name) =>
      requiredFunctionFiles.every((relPath) =>
        fs.existsSync(path.join(functionsRoot, name, relPath)),
      ),
    )
    .sort();
}

function parseGeneratorIds() {
  const source = fs.readFileSync(generatorPath, "utf8");
  const startMarker = "const functions = [";
  const endMarker = "const appwriteConfigPath =";
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error("Gagal parse blok const functions di generate_appwrite_json.cjs");
  }

  const block = source.slice(startIndex, endIndex);
  const ids = [...block.matchAll(/\$id:\s*"([^"]+)"/g)].map((match) => match[1]);
  return { ids: sortUnique(ids), duplicates: findDuplicates(ids) };
}

const dirIds = validFunctionDirs();
const { ids: generatorIds, duplicates: duplicateGenerator } = parseGeneratorIds();
const scopeIdsRaw = Object.keys(readJson(scopesPath));
const scopeIds = sortUnique(scopeIdsRaw);
const duplicateScopes = findDuplicates(scopeIdsRaw);
const configIdsRaw = readJson(configPath).functions.map((fn) => fn.$id);
const configIds = sortUnique(configIdsRaw);
const duplicateConfig = findDuplicates(configIdsRaw);

const missingInGenerator = diff(dirIds, generatorIds);
const missingInScopes = diff(dirIds, scopeIds);
const missingInConfig = diff(dirIds, configIds);

const generatorWithoutDir = diff(generatorIds, dirIds);
const scopesWithoutDir = diff(scopeIds, dirIds);
const configWithoutDir = diff(configIds, dirIds);

const duplicates = [
  ...duplicateGenerator.map((id) => `generator: ${id}`),
  ...duplicateScopes.map((id) => `scopes: ${id}`),
  ...duplicateConfig.map((id) => `config: ${id}`),
].sort();

const counts = {
  dirs: dirIds.length,
  generator: generatorIds.length,
  scopes: scopeIds.length,
  config: configIds.length,
};

const missingSourceDir = [
  ...generatorWithoutDir.map((id) => `generator: ${id}`),
  ...scopesWithoutDir.map((id) => `scopes: ${id}`),
  ...configWithoutDir.map((id) => `config: ${id}`),
].sort();

function printSection(title, values) {
  if (!values.length) return;
  console.log(`\n${title}`);
  for (const value of values) console.log(`- ${value}`);
}

console.log(`Function directories : ${counts.dirs}`);
console.log(`Generator definitions: ${counts.generator}`);
console.log(`Function scopes      : ${counts.scopes}`);
console.log(`Appwrite config      : ${counts.config}`);
console.log("");
console.log(`Missing in generator : ${missingInGenerator.length}`);
console.log(`Missing in scopes    : ${missingInScopes.length}`);
console.log(`Missing in config    : ${missingInConfig.length}`);
console.log(`Missing source dir   : ${missingSourceDir.length}`);
console.log(`Duplicates           : ${duplicates.length}`);

const countMismatch =
  counts.dirs !== counts.generator ||
  counts.dirs !== counts.scopes ||
  counts.dirs !== counts.config;

if (
  missingInGenerator.length ||
  missingInScopes.length ||
  missingInConfig.length ||
  missingSourceDir.length ||
  duplicates.length ||
  countMismatch
) {
  printSection("Missing in generator", missingInGenerator);
  printSection("Missing in scopes", missingInScopes);
  printSection("Missing in config", missingInConfig);
  printSection("Generator has no source dir", generatorWithoutDir);
  printSection("Scopes have no source dir", scopesWithoutDir);
  printSection("Config has no source dir", configWithoutDir);
  printSection("Duplicates", duplicates);
  if (countMismatch) {
    console.log("\nCount mismatch detected across sources.");
  }
  console.log("\nSTATUS: FAIL");
  process.exitCode = 1;
} else {
  console.log("\nSTATUS: PASS");
}
