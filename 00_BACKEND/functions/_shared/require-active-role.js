import { Query as AppwriteQuery } from "node-appwrite";

export async function requireActiveRole({
  databases,
  databaseId,
  usersCollectionId,
  userId,
  role,
  log,
  actionLabel,
  notFoundMessage,
  inactiveMessage,
  wrongRoleMessage,
  Query = AppwriteQuery,
}) {
  const usersRes = await databases.listDocuments(databaseId, usersCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  const userDoc = usersRes.documents[0] || null;

  if (!userDoc) {
    throw httpError(404, notFoundMessage);
  }
  if (userDoc.status && userDoc.status !== "active") {
    if (log && actionLabel) log(`${actionLabel} ditolak untuk ${userId}: status akun ${userDoc.status}`);
    throw httpError(403, inactiveMessage);
  }
  if (userDoc.role !== role) {
    if (log && actionLabel) log(`${actionLabel} ditolak untuk ${userId}: role ${userDoc.role}`);
    throw httpError(403, wrongRoleMessage);
  }

  return userDoc;
}

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
