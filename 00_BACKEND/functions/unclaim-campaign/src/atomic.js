export async function decrementColumn(env, collectionId, documentId, attribute, value, min = 0) {
  const endpoint = env.appwriteEndpoint.replace(/\/$/, "");
  const response = await fetch(`${endpoint}/tablesdb/${env.databaseId}/tables/${collectionId}/rows/${documentId}/${attribute}/decrement`, {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-appwrite-project": env.appwriteProjectId, "x-appwrite-key": env.appwriteApiKey },
    body: JSON.stringify({ value, min }),
  });
  if (!response.ok) throw new Error(`Atomic decrement failed (${response.status})`);
}
