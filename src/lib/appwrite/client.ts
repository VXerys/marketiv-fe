/**
 * Appwrite Browser Client
 *
 * Initializes the Appwrite SDK Client for browser-side use.
 * Browser-safe: uses only NEXT_PUBLIC_ config — no server SDK, no elevated credentials.
 */
import { Client } from "appwrite";
import { appwriteConfig } from "./config";

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export { client };
