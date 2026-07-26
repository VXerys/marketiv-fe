// Global setup for all unit & integration tests.
// 1. Provide env vars so `src/lib/appwrite/client.ts` does not throw at import.
// 2. Mock the `appwrite` SDK package. The project's `src/lib/appwrite`
//    wrapper imports `Account`, `Databases`, `Functions`, `Client`, `ID`,
//    `Query`, `Role`, `Permission` from this package, so mocking it makes
//    services transparently use the in-memory mock.

import { vi } from 'vitest';

process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://mock.appwrite.io/v1';
process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'mock-project';
process.env.NEXT_PUBLIC_DB_ID = process.env.NEXT_PUBLIC_DB_ID || 'db-test';

// Minimal browser-like globals used by service code (e.g. forgotPassword
// default redirectUrl reads window.location.origin).
(globalThis as any).window = (globalThis as any).window || {
  location: { origin: 'http://localhost:3000' },
};

const appwriteMock = await import('./../src/test-mocks/appwrite');

vi.mock('appwrite', () => appwriteMock);
