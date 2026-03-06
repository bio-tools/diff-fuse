import React from 'react';
import { useSessionId } from '../../hooks/session/useSessionId';
import { useDiffFuseStore } from '../../state/diffFuseStore';
import { useDiff } from '../../hooks/diffFuse/useDiff';
import { useMergeQuery } from '../../hooks/diffFuse/useMergeQuery';
import { Node } from './Node';
import { Card } from '../shared/cards/Card';
import { CardTitle } from '../shared/cards/CardTitle';
import { Clipboard, FileDown } from 'lucide-react';
import { toast } from "sonner";
import { useExportText } from "../../hooks/diffFuse/useExportText";
import { useExportDownload } from "../../hooks/diffFuse/useExportDownload";

const EMPTY_PER = { arrayStrategies: {}, selections: {} } as const;


export function DiffFuse() {
    const sessionId = useSessionId();          // string | null
    const sid = sessionId ?? '__no_session__'; // stable key for zustand selectors

    const ensure = useDiffFuseStore((s) => s.ensure);
    React.useEffect(() => {
        if (sessionId) ensure(sessionId);
    }, [sessionId, ensure]);

    const per = useDiffFuseStore((s) => (sessionId ? s.bySessionId[sessionId] ?? EMPTY_PER : EMPTY_PER));

    const diffReq = React.useMemo(
        () => ({ array_strategies: per.arrayStrategies }),
        [per.arrayStrategies]
    );

    const diffQuery = useDiff(sessionId, diffReq);
    const mergeQuery = useMergeQuery(sessionId, diffReq, per.selections);

    const exportReq = React.useMemo(() => ({
        merge_request: {
            diff_request: diffReq,
            selections: per.selections,
        },
        pretty: true,
        require_resolved: false,
    }), [diffReq, per.selections]);

    const exportText = useExportText();
    const exportDownload = useExportDownload();

    const exporting = exportText.isPending || exportDownload.isPending;
    const disabled = !sessionId || diffQuery.isLoading || diffQuery.isError || exporting;

    const onCopy = async () => {
        if (!sessionId) return;

        try {
            const res = await exportText.mutateAsync({
                sessionId,
                body: exportReq,
            });

            await navigator.clipboard.writeText(res.text);

            if (res.unresolved_paths?.length) {
                toast.message(`Copied (but ${res.unresolved_paths.length} unresolved).`);
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
                className="button ok"
                onClick={onCopy}
                disabled={disabled}
                title="Copy merged JSON"
            >
                <Clipboard className="icon" />
            </button>

            <button
                type="button"
                className="button ok"
                onClick={onDownload}
                disabled={disabled}
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
                mergedRoot={mergeQuery.data?.merged}
                sessionId={sessionId}
            />
        </div>
    );

    return (
        <Card title={<CardTitle title="Diff Fuse" rightButtons={rightButtons} />} defaultOpen={false}>
            {contentView}
        </Card>
    );
}