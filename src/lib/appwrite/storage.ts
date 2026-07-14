/**
 * Appwrite Storage Service Wrapper
 *
 * Exposes Storage SDK for browser-safe file operations.
 * Allowed: profile pictures, business logos, campaign image references (max 100MB).
 * FORBIDDEN: raw video uploads — use external URL (Google Drive/Dropbox) instead.
 * FORBIDDEN: creator video proof — use TikTok/Instagram URL in campaign_submissions.
 */
import { Storage } from "appwrite";
import { client } from "./client";

export const storage = new Storage(client);
