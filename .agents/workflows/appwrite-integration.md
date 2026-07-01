# Workflow — Appwrite Integration SOP

This document provides a step-by-step Standard Operating Procedure (SOP) for connecting UI components and pages to the Appwrite headless backend in Marketiv, enforcing strict security boundaries.

---

## Step 1 — Verify Client vs Server SDK Usage

To maintain security, clearly separate operations that run on the client from those that must run on the server:

1. **Client Reads:** Fetching non-sensitive, read-only data (like a creator's public portfolio or catalog page) can be done using the Appwrite Client SDK directly.
2. **Server Mutations:** Operations that write or edit database documents, trigger payments, update wallets, or claims, must use Appwrite Server SDK via **Next.js Server Actions** (`src/lib/actions/*.ts`) or **Appwrite Functions**.
3. **Secrets Check:** Verify that no Appwrite elevated API keys, credentials, or private credentials are embedded in any client-side JavaScript bundle.

---

## Step 2 — Implementing Database Reads (RSC Pattern)

Data fetching should be implemented at the page/container boundary:

1. **Implement Fetch in Server Component:** Fetch the data directly in your Server Component (e.g. `src/app/dashboard/umkm/page.tsx`):
   ```tsx
   import { databases } from "@/lib/appwrite";
   import { Query } from "appwrite";

   async function getUmkmCampaigns(profileId: string) {
     return await databases.listDocuments(
       DATABASE_ID,
       CAMPAIGN_COLLECTION_ID,
       [Query.equal("ownerId", profileId)]
     );
   }
   ```
2. **Pass to Children via Props:** Pass the fetched data directly to your interative Client Components:
   ```tsx
   const response = await getUmkmCampaigns(userProfile.id);
   return <CampaignFilter campaigns={response.documents} />;
   ```

---

## Step 3 — Implementing Mutations (Server Actions Pattern)

1. **Create Action File:** Create a Server Action file under `src/lib/actions/` (e.g. `campaign.ts`) with `"use server"` at the top.
2. **Retrieve Session & Validate Role:** Always fetch the current user session and check if the role matches the operation:
   ```typescript
   "use server";
   
   import { account } from "@/lib/appwrite/server"; // secure server SDK client

   export async function claimCampaignAction(campaignId: string) {
     const user = await account.get();
     // Validate user role is Kreator
     ...
   }
   ```
3. **Mutate via Appwrite Function:** If the action changes sensitive state (like claiming a campaign quota, releasing escrow funds, or requesting withdrawals), trigger an **Appwrite Function** instead of mutating the document directly to prevent race conditions:
   ```typescript
   import { functions } from "@/lib/appwrite/server";

   await functions.createExecution(
     "claimCampaignFunctionId",
     JSON.stringify({ campaignId, creatorId: user.$id })
   );
   ```

---

## Step 4 — Verification & Auditing Checklist

Before marking the integration complete:

- [ ] Has session verification been enforced on all backend endpoints/actions?
- [ ] Is direct client-side database document writing avoided for sensitive fields (`status`, `wallet`, `views`)?
- [ ] Has the new query/mutation been verified to run within the Appwrite permissions boundary?
- [ ] Are all financial mutations creating corresponding audit trail log documents?
