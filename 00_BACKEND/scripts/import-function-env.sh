#!/usr/bin/env bash
# import-function-env.sh
# Salin functions/<id>/.env dari paket kiriman ke repo, SAMBIL MENYARING.
#
# Paket .env kiriman berisi tiga hal yang akan membatalkan perbaikan 2026-07-29
# kalau disalin apa adanya lalu di-sync ke Appwrite:
#
#   1. DEFAULT_STORAGE_BUCKET_ID=campaign-assets
#      Mengembalikan lubang berkas terbuka publik. campaign-assets itu
#      read("any") + fileSecurity=false, jadi setiap berkas terunggah bisa
#      diunduh tanpa login DAN seluruh Permission.read per-berkas diabaikan
#      server. Harus `user-files`.
#      → lihat integration-context/2026-07-29-audit-live-*.md §3
#
#   2. APPWRITE_FUNCTION_API_ENDPOINT / APPWRITE_FUNCTION_PROJECT_ID
#      Nama berprefix reserved APPWRITE_. Appwrite meng-inject-nya sendiri saat
#      runtime dan injeksinya menang, jadi menyetelnya tidak berguna — tapi
#      membuat orang berikutnya mengira nilainya perlu diisi.
#
#   3. APPWRITE_API_KEY berisi SATU key yang sama untuk 26 Function.
#      Baca blok di bawah sebelum memutuskan.
#
# Penggunaan:
#   bash 00_BACKEND/scripts/import-function-env.sh "/c/Users/PLN/Downloads/functions + .env/functions"
#   bash 00_BACKEND/scripts/import-function-env.sh <sumber> --with-api-key
#
# Default: baris APPWRITE_API_KEY DIBUANG. Lihat --with-api-key di bawah.

set -euo pipefail

SRC="${1:-}"
WITH_KEY="${2:-}"
DEST="$(cd "$(dirname "$0")/../functions" && pwd)"

if [ -z "$SRC" ] || [ ! -d "$SRC" ]; then
  echo "Sumber tidak ditemukan. Contoh:"
  echo "  bash $0 \"/c/Users/PLN/Downloads/functions + .env/functions\""
  exit 1
fi

COPIED=0
SKIPPED=0
FIXED_BUCKET=0
DROPPED_RESERVED=0
DROPPED_KEY=0

for src_env in "$SRC"/*/.env; do
  [ -f "$src_env" ] || continue
  fn="$(basename "$(dirname "$src_env")")"

  if [ ! -d "$DEST/$fn" ]; then
    echo "  [SKIP] $fn — tidak ada di repo"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  out="$DEST/$fn/.env"
  : > "$out"

  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"

    case "$line" in
      DEFAULT_STORAGE_BUCKET_ID=*)
        echo "DEFAULT_STORAGE_BUCKET_ID=user-files" >> "$out"
        FIXED_BUCKET=$((FIXED_BUCKET + 1))
        continue ;;
      APPWRITE_FUNCTION_API_ENDPOINT=*|APPWRITE_FUNCTION_PROJECT_ID=*|APPWRITE_FUNCTION_API_KEY=*)
        DROPPED_RESERVED=$((DROPPED_RESERVED + 1))
        continue ;;
      APPWRITE_API_KEY=*)
        if [ "$WITH_KEY" != "--with-api-key" ]; then
          DROPPED_KEY=$((DROPPED_KEY + 1))
          continue
        fi ;;
    esac

    echo "$line" >> "$out"
  done < "$src_env"

  echo "  [OK]   $fn"
  COPIED=$((COPIED + 1))
done

echo
echo "Ringkasan: $COPIED disalin, $SKIPPED dilewati"
echo "  DEFAULT_STORAGE_BUCKET_ID dikoreksi ke user-files : $FIXED_BUCKET"
echo "  baris berprefix reserved dibuang                   : $DROPPED_RESERVED"
if [ "$WITH_KEY" = "--with-api-key" ]; then
  echo "  APPWRITE_API_KEY DIPERTAHANKAN (mode --with-api-key)"
else
  echo "  APPWRITE_API_KEY dibuang                           : $DROPPED_KEY"
fi
echo
echo "File .env ada di .gitignore — tidak akan ikut ter-commit."
echo "Langkah berikutnya:"
echo "  1. bash 00_BACKEND/scripts/sync-env-all-functions.sh"
echo "  2. node appwrite/ops/audit-live.mjs   # pastikan tetap 0 blocker"
