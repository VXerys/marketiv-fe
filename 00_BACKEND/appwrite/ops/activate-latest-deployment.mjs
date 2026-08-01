/**
 * Aktifkan deployment `ready` terbaru untuk tiap Function.
 *
 * `appwrite push functions` biasanya mengaktifkan deployment yang baru dibuatnya,
 * tapi kalau push berhenti di tengah — build nyangkut, CLI di-interrupt, jaringan
 * putus — deployment-nya terlanjur `ready` sementara pointer aktif tidak pernah
 * maju. Function tetap hidup, tetap lolos semua pemeriksaan config, dan tetap
 * menjalankan kode lama. Itu jenis kerusakan yang paling sulit dilihat.
 *
 * Ketahuan 2026-07-29 pada `create-order`: deployment aktifnya dari 2026-07-27
 * sementara ada 5 deployment `ready` dari 2026-07-29 yang tidak pernah dipakai.
 * Akibatnya dua notifikasi Alur B yang ditambahkan commit b8f976c tidak pernah
 * hidup di live, padahal kodenya ada di repo.
 *
 * Skrip ini TIDAK membuat deployment baru — untuk itu pakai `appwrite push
 * functions`. Ia hanya memindahkan pointer ke deployment `ready` terbaru yang
 * SUDAH ada. Jadi aman diulang, dan tidak pernah men-deploy kode yang belum
 * pernah dibangun.
 *
 * Endpoint yang dipakai `PATCH /functions/{id}/deployments/{depId}` — bukan
 * `PUT /functions/{id}`. Yang terakhir bersifat replace dan me-reset field yang
 * tidak dikirim; itu yang menghapus `events` di 8 Function pada 2026-07-27.
 * Jangan pindahkan logika ini ke `sync-functions.mjs`.
 *
 *   node appwrite/ops/activate-latest-deployment.mjs --dry
 *   node appwrite/ops/activate-latest-deployment.mjs
 */
import { aw, loadConfig } from "./client.mjs";

const DRY = process.argv.includes("--dry");
const config = loadConfig();

const short = (iso) => (iso ? String(iso).slice(0, 19).replace("T", " ") : "-");

let activated = 0;
let ok = 0;
let problems = 0;

for (const f of config.functions || []) {
  let live;
  try {
    live = await aw(`/functions/${f.$id}`);
  } catch (e) {
    console.log(`ERR    ${f.$id.padEnd(31)} tidak terbaca di live — ${e.message.slice(0, 160)}`);
    problems++;
    continue;
  }

  let deployments;
  try {
    const res = await aw(`/functions/${f.$id}/deployments`, {
      queries: [
        { method: "limit", values: [25] },
        { method: "orderDesc", values: ["$createdAt"] },
      ],
    });
    deployments = res.deployments || [];
  } catch (e) {
    console.log(`ERR    ${f.$id.padEnd(31)} daftar deployment gagal — ${e.message.slice(0, 160)}`);
    problems++;
    continue;
  }

  const activeId = live.deployment || live.deploymentId || "";
  const active = deployments.find((d) => d.$id === activeId);
  const newestReady = deployments.find((d) => d.status === "ready");

  if (!newestReady) {
    console.log(`NO-READY ${f.$id.padEnd(30)} tidak ada deployment "ready" di 25 terbaru — jalankan "appwrite push functions"`);
    problems++;
    continue;
  }

  if (activeId === newestReady.$id) {
    console.log(`ok     ${f.$id.padEnd(31)} aktif ${short(newestReady.$createdAt)}`);
    ok++;
    continue;
  }

  // `active` bisa undefined kalau deployment aktifnya sudah di luar 25 terbaru —
  // justru tanda paling jelas bahwa pointer-nya tertinggal jauh.
  const activeLabel = active ? short(active.$createdAt) : `${activeId || "(kosong)"} (di luar 25 terbaru)`;

  if (DRY) {
    console.log(`WOULD  ${f.$id.padEnd(31)} ${activeLabel}  →  ${short(newestReady.$createdAt)}`);
    activated++;
    continue;
  }

  try {
    await aw(`/functions/${f.$id}/deployments/${newestReady.$id}`, { method: "PATCH" });
    console.log(`OK     ${f.$id.padEnd(31)} ${activeLabel}  →  ${short(newestReady.$createdAt)}`);
    activated++;
  } catch (e) {
    console.log(`ERR    ${f.$id.padEnd(31)} gagal mengaktifkan ${newestReady.$id} — ${e.message.slice(0, 200)}`);
    problems++;
  }
}

const verb = DRY ? "akan diaktifkan" : "diaktifkan";
console.log(
  `\nRingkasan: ${activated} ${verb}, ${ok} sudah terbaru, ${problems} bermasalah` +
    `${DRY ? " (dry-run, tidak ada yang ditulis)" : ""}.`
);
if (!DRY && activated > 0) {
  console.log("Verifikasi: node appwrite/ops/audit-live.mjs");
}
