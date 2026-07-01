/**
 * Appwrite Databases Service Wrapper
 *
 * Exposes Databases SDK for client-side authenticated reads.
 * Direct writes are only allowed for non-sensitive user-owned fields.
 * All sensitive mutations (escrow, wallet, status) must go through
 * Appwrite Functions or secure Server Actions — not this wrapper.
 */
import { Databases } from "appwrite";
import { client } from "./client";

export const databases = new Databases(client);
