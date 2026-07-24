#!/usr/bin/env bash
set -euo pipefail

FUNCTIONS_DIR="$(cd "$(dirname "$0")/../functions" && pwd)"
TOTAL=23
CURRENT=0
FAILED=()

echo "============================================"
echo "  Deploy All Appwrite Functions ($TOTAL)"
echo "============================================"
echo ""

deploy_one() {
  local id="$1"
  local code_dir="$FUNCTIONS_DIR/$id"

  if [ ! -d "$code_dir" ]; then
    echo "  [SKIP] $id — directory not found: $code_dir"
    FAILED+=("$id (no dir)")
    return
  fi

  CURRENT=$((CURRENT + 1))
  echo "[$CURRENT/$TOTAL] Deploying $id..."

  if appwrite functions create-deployment \
    --function-id "$id" \
    --code "$code_dir" \
    --activate=true \
    --entrypoint src/main.js \
    --commands "npm install" 2>&1; then
    echo "  [OK] $id deployed successfully"
  else
    echo "  [FAIL] $id deployment failed"
    FAILED+=("$id")
  fi
  echo ""
}

deploy_one "create-user-profile"
deploy_one "create-user-wallet"
deploy_one "validate-and-upload"
deploy_one "delete-file"
deploy_one "campaign-published"
deploy_one "campaign-claimed"
deploy_one "expire-stale-claims"
deploy_one "ai-brief"
deploy_one "ai-fraud-precheck"
deploy_one "calculate-campaign-reward"
deploy_one "create-order"
deploy_one "create-payment"
deploy_one "midtrans-webhook"
deploy_one "create-escrow"
deploy_one "release-escrow"
deploy_one "send-chat-notification"
deploy_one "get-umkm-dashboard-summary"
deploy_one "get-umkm-finance-summary"
deploy_one "get-umkm-profile"
deploy_one "get-creator-directory"
deploy_one "get-creator-profile"
deploy_one "get-creator-dashboard-summary"
deploy_one "get-creator-negotiations"

echo "============================================"
echo "  Summary: $((TOTAL - ${#FAILED[@]}))/$TOTAL OK"
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "  Failed: ${FAILED[*]}"
fi
echo "============================================"
