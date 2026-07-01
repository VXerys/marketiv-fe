/**
 * Appwrite Account Service Wrapper
 *
 * Exposes Account SDK for client-side auth operations:
 * login, logout, session check, email verification.
 * Do NOT perform sensitive profile mutations here — use Server Actions.
 */
import { Account } from "appwrite";
import { client } from "./client";

export const account = new Account(client);
