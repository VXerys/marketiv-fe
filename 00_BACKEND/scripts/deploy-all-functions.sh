#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_PATH="$BACKEND_DIR/appwrite.config.json"
CURRENT=0
FAILED=()

mapfile -t FUNCTION_IDS < <(
  node -e 'const fs=require("fs"); const cfg=JSON.parse(fs.readFileSync(process.argv[1], "utf8")); for (const fn of cfg.functions || []) console.log(fn.$id);' \
    "$CONFIG_PATH"
)
TOTAL="${#FUNCTION_IDS[@]}"

echo "============================================"
echo "  Deploy All Appwrite Functions ($TOTAL)"
echo "============================================"
echo ""

deploy_one() {
  local id="$1"
  local code_dir="$BACKEND_DIR/functions/$id"

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

for id in "${FUNCTION_IDS[@]}"; do
  deploy_one "$id"
done

echo "============================================"
echo "  Summary: $((TOTAL - ${#FAILED[@]}))/$TOTAL OK"
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "  Failed: ${FAILED[*]}"
fi
echo "============================================"
