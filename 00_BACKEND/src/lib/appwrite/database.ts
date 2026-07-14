import { Databases } from 'appwrite';
import { appwriteClient } from './client';

export const databases = new Databases(appwriteClient);
