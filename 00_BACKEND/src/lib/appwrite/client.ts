import { Client } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint) {
  throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT belum dikonfigurasi');
}

if (!projectId) {
  throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID belum dikonfigurasi');
}

export const appwriteClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);
