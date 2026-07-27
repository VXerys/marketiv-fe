/**
 * check-deployments.mjs — daftar deployment aktif + jumlah eksekusi tiap Function.
 * READ-ONLY.
 *
 *   node appwrite/ops/check-deployments.mjs
 *
 * Catatan: `activeDep=NONE` untuk semua function pernah terlihat di Appwrite
 * 1.9.x dan diduga alarm palsu karena nama field berubah (`deployment` →
 * `deploymentId`/`latestDeploymentId`). Karena itu script ini mencetak beberapa
 * kandidat nama field sekaligus, bukan hanya satu.
 */
import { aw, q } from "./client.mjs";

const fns = await aw("/functions", { queries: [q.limit(100)] });

for (const f of fns.functions) {
  const active =
    f.deployment ||
    f.deploymentId ||
    f.latestDeploymentId ||
    f.latestDeployment ||
    "NONE";

  let dep = "?";
  try {
    const d = await aw(`/functions/${f.$id}/deployments`, { queries: [q.limit(3)] });
    dep =
      d.total === 0
        ? "0 deployments"
        : d.deployments
            .map((x) => `${x.$id}:${x.status}:${x.$createdAt}`)
            .join(" | ");
  } catch (e) {
    dep = "ERR " + e.message.slice(0, 120);
  }

  let ex = "?";
  try {
    const e = await aw(`/functions/${f.$id}/executions`, { queries: [q.limit(1)] });
    ex = `${e.total} executions`;
  } catch {
    ex = "ERR";
  }

  console.log(
    `${f.$id.padEnd(32)} active=${String(active).padEnd(22)} ${ex.padEnd(16)} ${dep}`
  );
}
