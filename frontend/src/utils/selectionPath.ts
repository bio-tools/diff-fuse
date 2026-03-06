export function parentPaths(path: string): string[] {
    // returns: ["a.b[0].c", "a.b[0]", "a.b", "a", ""]
    const out: string[] = [];
    let cur = path;

    while (true) {
        out.push(cur);

        if (cur === "") break;

        // remove last segment:
        // - if ends with [N], drop that bracket
        // - else drop ".key"
        const bracket = cur.match(/^(.*)\[(\d+)\]$/);
        if (bracket) {
            cur = bracket[1]; // drop [N]
            continue;
        }

        const dot = cur.lastIndexOf(".");
        if (dot >= 0) {
            cur = cur.slice(0, dot);
            continue;
        }

        // single segment left (e.g., "a")
        cur = "";
    }

    return out;
}

export function getEffectiveSelection<T>(
    selections: Record<string, T>,
    path: string
): { at: string; sel: T } | null {
    for (const p of parentPaths(path)) {
        const sel = selections[p];
        if (sel !== undefined) return { at: p, sel };
    }
    return null;
}