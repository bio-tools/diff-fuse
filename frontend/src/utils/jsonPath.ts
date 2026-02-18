export function getAtPath(root: any, path: string): any {
    if (!path) return root;

    // supports: a.b[0].c
    const parts: (string | number)[] = [];
    const re = /([^[.\]]+)|\[(\d+)\]/g;
    let m: RegExpExecArray | null;

    while ((m = re.exec(path))) {
        if (m[1] !== undefined) parts.push(m[1]);
        else if (m[2] !== undefined) parts.push(Number(m[2]));
    }

    let cur = root;
    for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p as any];
    }
    return cur;
}