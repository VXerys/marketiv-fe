/**
 * Appwrite Functions Service Wrapper
 *
 * Exposes Functions SDK for triggering trusted backend execution.
 * All sensitive mutations (claim campaign, escrow, withdrawal, payout)
 * must be triggered via Functions — never directly from frontend state.
 *
 * Future: add typed helper wrappers per function as features are implemented.
 */
import { Functions } from "appwrite";
import { client } from "./client";

export const functions = new Functions(client);
