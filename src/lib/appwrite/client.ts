/**
 * Appwrite Browser Client
 *
 * Initializes the Appwrite SDK Client for browser-side use.
 * Browser-safe: uses only NEXT_PUBLIC_ config — no server SDK, no elevated credentials.
 */
import { Client } from "appwrite";
import { appwriteConfig } from "./config";

const client = new Client();

if (appwriteConfig.endpoint) {
  client.setEndpoint(appwriteConfig.endpoint);
} else {
  client.setEndpoint("https://dummy.appwrite.endpoint/v1"); // Prevent crash
}

if (appwriteConfig.projectId) {
  client.setProject(appwriteConfig.projectId);
}

export { client };
