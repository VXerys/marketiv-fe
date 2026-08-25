# Deployment Handoff Requirements

At end, Codex must not merely say “redeploy backend”.

Generate an exact matrix.

## Required format

| Component | Changed? | Deploy action | Dependency/order | Runtime verification |
|---|---:|---|---|---|

Categories:

### Frontend Marketiv
- routes/components/services changed
- hosting redeploy required

### Admin frontend
- if Admin review UI changed
- admin hosting redeploy required

### Appwrite schema
List exact:
- collection/table
- new/changed attributes
- required/optional
- indexes
- permissions if changed

Schema deploy happens before Function that depends on new fields.

Wait for attribute/index status ready before Function deploy.

### Appwrite Functions
List:
- exact Function name
- exact reason
- events if changed
- environment variable changes

### Event wiring
If new validation Function/event added:
- exact trigger
- source table
- expected payload/state

### External provider
If Midtrans/social provider config required:
- list required config name only;
- never print secret value.

## Deployment order example

1. schema
2. wait available
3. Functions that write new schema
4. Functions that read/enforce new schema
5. Admin/frontend
6. staging smoke

## No completion claim

If code changed but deployment not run:
status is `CODE_FIXED_RUNTIME_PENDING`.
