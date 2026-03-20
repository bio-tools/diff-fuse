/**
 * Top-level diff/merge feature container.
 *
 * This component ties together:
 * - session-scoped local UI state from Zustand
 * - diff and merge queries from the backend
 * - node-index derivation from the diff tree
 * - export actions (copy/download)
 */

import { Eye, Clipboard, FileDown } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useDiff } from "../../hooks/diffFuse/useDiff";
import { useExportDownload } from "../../hooks/diffFuse/useExportDownload";
import { useExportText } from "../../hooks/diffFuse/useExportText";
import { useMergeQuery } from "../../hooks/diffFuse/useMergeQuery";
import { useSessionId } from "../../hooks/session/useSessionId";
import { useDiffFuseStore } from "../../state/diffFuseStore";
import { buildNodeIndex } from "../../utils/nodeIndex";
import { Card } from "../shared/cards/Card";
import { CardTitle } from "../shared/cards/CardTitle";
import { Modal } from "../shared/cards/Modal";
import { JsonPreview } from "../shared/JsonPreview";
import { Node } from "./Node";
import styles from "./DiffFuse.module.css";

/**
 * Fallback per-session state used before a session entry exists in the store.
 */
const EMPTY_PER = {
    arrayStrategiesByNodeId: {},
    selectionsByNodeId: {},
    nodeIndex: {},
} as const;

/**
 * Render the diff/merge workspace for the active session.
 *
 * Returns `null` when no session is active in the route.
 */
export function DiffFuse() {
    const sessionId = useSessionId(); // string | null

    const ensure = useDiffFuseStore((s) => s.ensure);
    // Ensure the session-scoped UI bucket exists as soon as the route identifies a session.
    React.useEffect(() => {
        if (sessionId) ensure(sessionId);
    }, [sessionId, ensure]);

    const per = useDiffFuseStore((s) => (sessionId ? (s.bySessionId[sessionId] ?? EMPTY_PER) : EMPTY_PER));

    const diffReq = React.useMemo(
        () => ({ array_strategies_by_node_id: per.arrayStrategiesByNodeId }),
        [per.arrayStrategiesByNodeId]
    );

    const diffQuery = useDiff(sessionId, diffReq);
    const mergeQuery = useMergeQuery(sessionId, diffReq, per.selectionsByNodeId);

    const setNodeIndex = useDiffFuseStore((s) => s.setNodeIndex);

    const root = diffQuery.data?.root;

    // Rebuild the derived node index whenever a fresh diff tree arrives.
    React.useEffect(() => {
        if (!sessionId) return;
        if (!root) return;
        setNodeIndex(sessionId, buildNodeIndex(root));
    }, [sessionId, root, setNodeIndex]);

    const [visibilityMode, setVisibilityMode] = React.useState<"all" | "changed">("all");

    // Export reuses the same merge configuration currently driving the live preview.
    const exportReq = React.useMemo(
        () => ({
            merge_request: {
                diff_request: diffReq,
                selections_by_node_id: per.selectionsByNodeId,
            },
            pretty: true,
            require_resolved: false,
        }),
        [diffReq, per.selectionsByNodeId]
    );

    const previewExportText = useExportText();
    const copyExportText = useExportText();
    const exportDownload = useExportDownload();

    const [previewOpen, setPreviewOpen] = React.useState(false);

    const disabledBase = !sessionId || diffQuery.isLoading || diffQuery.isError;

    const previewLoading = previewExportText.isPending;
    const copyBusy = copyExportText.isPending;
    const downloadBusy = exportDownload.isPending;

    const onPreview = async () => {
        if (!sessionId) return;

        setPreviewOpen(true);

        previewExportText.mutate({
            sessionId,
            body: exportReq,
        });
    };

    const onCopy = async () => {
        if (!sessionId) return;

        try {
            const res = await copyExportText.mutateAsync({
                sessionId,
                body: exportReq,
            });

            await navigator.clipboard.writeText(res.text);

            if (res.unresolved_node_ids?.length) {
                toast.message(`Copied (but ${res.unresolved_node_ids.length} unresolved).`);
            } else {
                toast.success("Copied merged JSON.");
            }
        } catch (e) {
            console.error("Copy failed:", e);
            // toast.error("Copy failed.");
            toast.error(`Copy failed: ${e instanceof Error ? e.message : String(e)}`);
        }
    };

    function downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    const onDownload = async () => {
        if (!sessionId) return;

        try {
            const blob = await exportDownload.mutateAsync({
                sessionId,
                body: exportReq,
            });

            downloadBlob(blob, `diff-fuse-${sessionId}.json`);
            toast.success("Downloaded merged JSON.");
        } catch (e) {
            toast.error("Download failed.");
        }
    };

    if (!sessionId) return null;

    const rightButtons = (
        <>
            <button
                type="button"
                className="button cancel"
                onClick={() =>
                    setVisibilityMode((prev) => (prev === "all" ? "changed" : "all"))
                }
                disabled={disabledBase}
                title={visibilityMode === "all" ? "Show only changed nodes" : "Show all nodes"}
            >
                {visibilityMode === "all" ? "All" : "Changed"}
            </button>

            <button
                type="button"
                className="button ok"
                onClick={onPreview}
                disabled={disabledBase || previewLoading}
                title="Preview merged JSON"
            >
                <Eye className="icon" />
            </button>

            <button
                type="button"
                className="button ok"
                onClick={onCopy}
                disabled={disabledBase || copyBusy}
                title="Copy merged JSON"
            >
                <Clipboard className="icon" />
            </button>

            <button
                type="button"
                className="button ok"
                onClick={onDownload}
                disabled={disabledBase || downloadBusy}
                title="Download merged JSON"
            >
                <FileDown className="icon" />
            </button>
        </>
    );

    const contentView = diffQuery.isLoading ? (
        <div>Loading diff...</div>
    ) : diffQuery.isError ? (
        <div>Error loading diff: {String(diffQuery.error)}</div>
    ) : (
        <div className="diffTree">
            <Node
                node={diffQuery.data!.root}
                docIds={Object.keys(diffQuery.data!.root.per_doc ?? {})}
                mergedHere={mergeQuery.data?.merged}
                resolvedRefByNodeId={mergeQuery.data?.resolved_ref_by_node_id ?? {}}
                sessionId={sessionId}
                visibilityMode={visibilityMode}
            />
        </div>
    );

    return (
        <>
            <Card title={<CardTitle title="Diff Fuse" rightButtons={rightButtons} />} defaultOpen={true}>
                {contentView}
            </Card>

            <Modal
                title="Merged JSON preview"
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
            >
                {previewExportText.isPending ? (
                    <div>Loading preview…</div>
                ) : previewExportText.isError ? (
                    <div>Error loading preview: {String(previewExportText.error)}</div>
                ) : !previewExportText.data ? (
                    <div>No preview loaded.</div>
                ) : (
                    <>
                        {previewExportText.data.unresolved_node_ids?.length ? (
                            <div className={styles.omissions}>
                                Contains unresolved omissions: {previewExportText.data.unresolved_node_ids.length}
                            </div>
                        ) : null}

                        <JsonPreview text={previewExportText.data.text} />
                    </>
                )}
            </Modal>
        </>
    );
}
