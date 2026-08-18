import { Check, CircleCheck } from "lucide-react";
import { DiffStatus } from "../../../api/generated";
import type { ResolutionState } from "../resolution";
import { statusLabel } from "../statusLabels";
import styles from "./NodeTitle.module.css";

interface Props {
    title: string;
    prefix?: string;
    status?: DiffStatus;
    resolution?: ResolutionState;
    rightButtons?: React.ReactNode;
}

/**
 * Per-status pill colour. `diff` keeps the neutral default; `missing` and
 * `type_error` get their own so the three read apart at a glance instead of
 * only differing by label text.
 */
function statusClass(status: DiffStatus): keyof typeof styles | null {
    if (status === DiffStatus.MISSING) return "missing";
    if (status === DiffStatus.TYPE_ERROR) return "attention";
    return null;
}

/**
 * Marker for how settled a row is.
 *
 * Two shapes rather than two shades alone, so the difference survives without
 * colour. Unresolved rows get nothing -- absence is the signal that it is your
 * turn.
 */
function ResolutionMark({ resolution }: { resolution: ResolutionState }) {
    if (resolution === "unresolved") return null;

    const chosen = resolution === "chosen";
    return (
        <span
            className={`${styles.resolution} ${chosen ? styles.chosen : styles.auto}`}
            title={chosen ? "Resolved by your choice" : "Resolved automatically"}
        >
            {chosen ? <CircleCheck className="icon" /> : <Check className="icon" />}
        </span>
    );
}

export function NodeTitle({ title, prefix, status, resolution, rightButtons }: Props) {
    return (
        <div className={styles.title}>
            <div className={styles.titleAndStatus}>
                <div className={styles.titleText}>
                    {prefix && <span className={styles.prefix}>{prefix}</span>}
                    <span className={styles.mainTitle}>{title}</span>
                </div>
                {status && status !== DiffStatus.SAME && (
                    <span className={`${styles.status} ${styles[statusClass(status) ?? ""] ?? ""}`}>
                        {statusLabel(status)}
                    </span>
                )}
                {resolution && <ResolutionMark resolution={resolution} />}
            </div>
            {rightButtons && <div className={styles.rightButtons}>{rightButtons}</div>}
        </div>
    );
}
