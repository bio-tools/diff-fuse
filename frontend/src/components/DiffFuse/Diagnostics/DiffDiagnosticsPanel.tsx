/**
 * Read-only diagnostics view for the current diff tree.
 *
 * Shows per-status node counts and the backend explanations attached to
 * incompatible nodes, which are otherwise not surfaced anywhere in the UI.
 */

import { DiffStatus } from "../../../api/generated";
import { statusLabel } from "../statusLabels";
import styles from "./DiffDiagnosticsPanel.module.css";
import type { DiffDiagnostics } from "./diffDiagnostics";

const ROOT = "<root>";

/** Counts are shown changed-first, which reads better than enum order. */
const COUNT_ORDER = [DiffStatus.DIFF, DiffStatus.MISSING, DiffStatus.TYPE_ERROR, DiffStatus.SAME] as const;

export function DiffDiagnosticsPanel({ diagnostics }: { diagnostics: DiffDiagnostics }) {
    const { counts, total, typeErrors, propagatedTypeErrors } = diagnostics;

    if (total === 0) {
        return <div className={styles.empty}>No diff loaded.</div>;
    }

    return (
        <div className={styles.panel}>
            <div className={styles.countsRow}>
                {COUNT_ORDER.map((status) => {
                    const attention = status === DiffStatus.TYPE_ERROR && counts[status] > 0;
                    return (
                        <span
                            key={status}
                            className={`${styles.countPill} ${attention ? styles.countPillAttention : ""}`}
                        >
                            {statusLabel(status)} <span className={styles.countValue}>{counts[status]}</span>
                        </span>
                    );
                })}
            </div>

            <h3>Incompatible values</h3>

            {typeErrors.length === 0 ? (
                <div className={styles.empty}>No incompatible values in this diff.</div>
            ) : (
                <div className={styles.list}>
                    {typeErrors.map((entry) => (
                        <div key={entry.nodeId} className={styles.entry}>
                            <div className={styles.entryPath}>{entry.path === "" ? ROOT : entry.path}</div>
                            <div className={styles.entryMessage}>{entry.message}</div>
                            <div className={styles.entryKind}>{entry.kind}</div>
                        </div>
                    ))}
                </div>
            )}

            {propagatedTypeErrors > 0 && (
                <div className={styles.footnote}>
                    + {propagatedTypeErrors} parent node{propagatedTypeErrors === 1 ? "" : "s"} marked incompatible
                    because of a nested value. Resolve the entries above and they clear too.
                </div>
            )}
        </div>
    );
}
