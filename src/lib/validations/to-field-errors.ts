import { z } from "zod";

/**
 * Ratakan ZodError → Record<field, pesan> (kontrak ValidationError yang dipakai
 * seluruh form di app). Ambil ISU PERTAMA per path, sama seperti validator
 * hand-rolled sebelumnya. Path Zod = nama field, jadi errors.title dst. cocok.
 */
export function toFieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

/** safeParse dibungkus jadi bentuk {ok, data|errors} yang dipakai form. */
export function parseOrErrors<S extends z.ZodType>(
  schema: S,
  value: unknown
): ParseResult<z.infer<S>> {
  const res = schema.safeParse(value);
  if (res.success) return { ok: true, data: res.data };
  return { ok: false, errors: toFieldErrors(res.error) };
}
