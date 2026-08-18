import { DiffStatus } from "../../api/generated";

/**
 * User-facing labels for diff statuses.
 *
 * Every non-`same` status is a kind of difference, so the labels share a "diff:"
 * prefix and only the suffix says which kind. They are kept short on purpose --
 * the Info panel carries the full explanation.
 *
 * These are display labels only. The wire values are unchanged, so anything
 * comparing or keying on `DiffStatus` keeps working.
 */
const LABELS: Record<DiffStatus, string> = {
    [DiffStatus.SAME]: "same",
    [DiffStatus.DIFF]: "diff",
    [DiffStatus.MISSING]: "diff: missing",
    [DiffStatus.TYPE_ERROR]: "diff: incompatible",
};

export function statusLabel(status: DiffStatus): string {
    return LABELS[status] ?? status;
}
