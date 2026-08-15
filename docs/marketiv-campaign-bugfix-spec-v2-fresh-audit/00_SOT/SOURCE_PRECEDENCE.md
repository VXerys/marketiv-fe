# Source Precedence

Resolve conflicts in this order:

1. **Current checked-out `staging` code**
   - package/config;
   - route/import structure;
   - Appwrite clients;
   - Functions;
   - tests;
   - current schemas/config.
2. **Current accepted Campaign/Admin domain decisions**
   - Creator = submitter;
   - Admin Marketiv = final Campaign submission validator;
   - UMKM = observer/read-only;
   - fraud = advisory;
   - trusted backend = final reward/ledger authority.
3. **Current Trello Campaign SOT + active defect cards** listed in `manifest.json`.
4. **Approved standalone Admin architecture**
   - Admin frontend in `admin/`;
   - user/admin share the same Appwrite backend per environment.
5. **This fresh v2 spec**.
6. Older docs/specs/agent prompts as supporting reference only.

## Conflict rule

If current `staging` has already changed:

- preserve newer valid behavior;
- do not reimplement an already-fixed issue;
- verify it;
- document drift;
- execute only the still-valid phase scope.
