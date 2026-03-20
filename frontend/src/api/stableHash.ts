/**
 * Deterministically stringify a value for cache/query-key purposes.
 *
 * Object keys are sorted recursively so semantically equivalent objects produce
 * the same hash even if key order differs.
 *
 * Notes
 * -----
 * Circular references are replaced with the string "[Circular]".
 */
export function stableHash(x: unknown): string {
    const seen = new WeakSet<object>();

    const norm = (v: any): any => {
        if (v === null || typeof v !== "object") return v;
        if (seen.has(v)) return "[Circular]";
        seen.add(v);

        if (Array.isArray(v)) return v.map(norm);

        const out: Record<string, any> = {};
        for (const k of Object.keys(v).sort()) out[k] = norm(v[k]);
        return out;
    };

    return JSON.stringify(norm(x));
}
