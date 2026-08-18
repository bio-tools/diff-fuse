import { type DiffNode, DiffStatus, type NodeKind } from "../../../api/generated";

/**
 * One reported diagnostic, corresponding to a node that carries an explanation.
 */
export type DiffDiagnosticEntry = {
    nodeId: string;
    /** Raw backend path. The root path is "". */
    path: string;
    kind: NodeKind;
    message: string;
};

/**
 * Node-level diagnostics collected from a diff tree.
 *
 * `typeErrors` holds only the nodes where a type error originates, i.e. those
 * carrying a backend `message`. Because the backend aggregates `type_error`
 * upward, every ancestor of such a node also reports `type_error` but without a
 * message; those are counted in `propagatedTypeErrors` instead of being listed.
 */
export type DiffDiagnostics = {
    counts: Record<DiffStatus, number>;
    total: number;
    typeErrors: DiffDiagnosticEntry[];
    propagatedTypeErrors: number;
};

function emptyCounts(): Record<DiffStatus, number> {
    return {
        [DiffStatus.SAME]: 0,
        [DiffStatus.DIFF]: 0,
        [DiffStatus.MISSING]: 0,
        [DiffStatus.TYPE_ERROR]: 0,
    };
}

/**
 * Walk a diff tree and summarise per-status node counts and type-error messages.
 *
 * Accepts `undefined` so callers can memoize unconditionally while the diff
 * query is still loading.
 *
 * Entries are returned in document order (pre-order traversal).
 */
export function collectDiagnostics(root: DiffNode | undefined): DiffDiagnostics {
    const counts = emptyCounts();
    const typeErrors: DiffDiagnosticEntry[] = [];
    let total = 0;
    let propagatedTypeErrors = 0;

    const walk = (node: DiffNode) => {
        counts[node.status] += 1;
        total += 1;

        if (node.status === DiffStatus.TYPE_ERROR) {
            if (node.message) {
                typeErrors.push({
                    nodeId: node.node_id,
                    path: node.path,
                    kind: node.kind,
                    message: node.message,
                });
            } else {
                propagatedTypeErrors += 1;
            }
        }

        for (const child of node.children ?? []) {
            walk(child);
        }
    };

    if (root) walk(root);

    return { counts, total, typeErrors, propagatedTypeErrors };
}
