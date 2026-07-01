/**
 * Appwrite Realtime Helper
 *
 * Re-exports the shared client for Realtime subscriptions.
 * Use client.subscribe() for Rate Card chat messages, notification badges,
 * order status updates, and submission status updates.
 *
 * FORBIDDEN: Do not subscribe to broad private collections.
 * FORBIDDEN: Do not rely on Realtime for authorization — always confirm
 *            final state with a trusted read when needed.
 *
 * Example usage (in a Client Component):
 *   const unsubscribe = realtimeClient.subscribe(
 *     `databases.${databaseId}.collections.messages.documents`,
 *     (response) => { ... }
 *   );
 *   return () => unsubscribe();
 */
export { client as realtimeClient } from "./client";
