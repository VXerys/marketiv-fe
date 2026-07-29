#!/usr/bin/env bash
# 
# CATATAN 2026-07-29: skrip ini butuh `jq` DAN CLI `appwrite` di PATH. Di mesin
# MINGW64 dev keduanya tidak ada, sehingga seluruh 28 Function dilaporkan
# "NOT DEPLOYED" padahal semuanya live. Gunakan padanan Node-nya yang tidak
# punya dependensi tambahan:
#
#   node appwrite/ops/sync-function-vars.mjs --dry
#   node appwrite/ops/sync-function-vars.mjs
#
# sync-env-all-functions.sh
# Sync all env vars from each function's .env to Appwrite.
#
# Reads functions/<id>/.env and creates/updates each variable.
# Handles new vars, changed values, secret detection.
#
# Prasyarat:
#   - appwrite CLI terinstall dan login
#   - jq terinstall
#   - .env files exist under functions/<id>/.env
#
# Penggunaan:
#   bash 00_BACKEND/scripts/sync-env-all-functions.sh

set -euo pipefail

FUNCTIONS_DIR="$(cd "$(dirname "$0")/../functions" && pwd)"

# CLI Appwrite tidak selalu ada di PATH (di MINGW64 biasanya tidak, padahal
# `npx appwrite` jalan). Deteksi sekali di awal, lalu pakai $AW di seluruh skrip.
if command -v appwrite >/dev/null 2>&1; then
  AW=(appwrite)
elif npx --no-install appwrite --version >/dev/null 2>&1; then
  AW=(npx --no-install appwrite)
else
  echo "ERROR: CLI Appwrite tidak ditemukan."
  echo "  Pasang global : npm i -g appwrite-cli"
  echo "  Atau lokal    : npm i -D appwrite-cli   (lalu npx appwrite ...)"
  exit 1
fi
echo "CLI: ${AW[*]}"

TOTAL=0
CREATED=0
UPDATED=0
SKIPPED=0
FAILED_FUNCTIONS=()

is_secret() {
  local key="$1"
  case "$key" in
    *KEY*|*SECRET*|*PASSWORD*|*TOKEN*|*SIGNATURE*)
      return 0 ;;
    *) return 1 ;;
  esac
}

sync_function() {
  local fn="$1"
  local env_file="$FUNCTIONS_DIR/$fn/.env"

  if [ ! -f "$env_file" ]; then
    echo "  [SKIP] $fn -- no .env"
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  TOTAL=$((TOTAL + 1))
  echo "[$TOTAL] $fn..."

  local raw_output
  raw_output=$("${AW[@]}" --json functions list-variables --function-id "$fn" 2>&1) || {
    # Ini BUKAN berarti Function belum di-deploy — perintahnya gagal karena
    # alasan apa pun (CLI belum login, endpoint region salah, function-id tidak
    # ada). Tampilkan errornya, jangan menebak sebabnya.
    echo "   [GAGAL] tidak bisa membaca variabel:"
    echo "$raw_output" | head -3 | sed 's/^/      /'
    FAILED_FUNCTIONS+=("$fn")
    return
  }
  local existing_json
  existing_json=$(echo "$raw_output" | grep -v '♥' | grep -v '^\s*$' 2>/dev/null || echo '{"total":0,"variables":[]}')

  local func_ok=true

  while IFS='=' read -r key rest; do
    rest="${rest%%#*}"
    rest="${rest%"${rest##*[![:space:]]}"}"
    key="${key%"${key##*[![:space:]]}"}"
    [[ -z "$key" ]] && continue
    [[ -z "$rest" ]] && continue
    [[ "$key" =~ ^[[:space:]]*# ]] && continue

    if is_secret "$key"; then
      local secret_flag="--secret true"
    else
      local secret_flag="--secret false"
    fi

    local existing_var_id
    existing_var_id=$(echo "$existing_json" | jq -r --arg k "$key" '.variables[] | select(.key==$k) | ."$id"' 2>/dev/null || true)

    if [ -n "$existing_var_id" ]; then
      echo "   UPD $key"
      if ! "${AW[@]}" functions update-variable \
        --function-id "$fn" \
        --variable-id "$existing_var_id" \
        --key "$key" \
        --value "$rest" \
        $secret_flag > /dev/null 2>&1; then
        echo "   [FAIL] $key update failed"
        func_ok=false
      else
        UPDATED=$((UPDATED + 1))
      fi
    else
      echo "   NEW $key"
      local uid="${key}_${$}_$(date +%s | tail -c 6)"
      if ! "${AW[@]}" functions create-variable \
        --function-id "$fn" \
        --variable-id "$uid" \
        --key "$key" \
        --value "$rest" \
        $secret_flag > /dev/null 2>&1; then
        echo "   [FAIL] $key create failed"
        func_ok=false
      else
        CREATED=$((CREATED + 1))
      fi
    fi
  done < <(
    sed -n '/^[[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*=/p' "$env_file" | sed 's/^[[:space:]]*//'
  )

  if [ "$func_ok" = false ]; then
    FAILED_FUNCTIONS+=("$fn")
  fi
  echo ""
}

echo "============================================"
echo "  Sync Env Vars to Appwrite Functions"
echo "============================================"
echo ""

for fn_dir in "$FUNCTIONS_DIR"/*/; do
  fn=$(basename "$fn_dir")
  sync_function "$fn"
done

echo "============================================"
echo "  Summary"
echo "  Functions: $TOTAL"
echo "  Created:   $CREATED"
echo "  Updated:   $UPDATED"
echo "  Skipped:   $SKIPPED"
if [ ${#FAILED_FUNCTIONS[@]} -gt 0 ]; then
  echo "  Failed:    ${#FAILED_FUNCTIONS[@]} (${FAILED_FUNCTIONS[*]})"
else
  echo "  Failed:    0"
fi
echo "============================================"
