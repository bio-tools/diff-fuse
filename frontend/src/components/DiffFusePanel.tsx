import React from 'react';
import { useSessionStore } from '../state/sessionStore';
import { useDiffFuseStore } from '../state/diffFuseStore';
import { useDiff } from '../hooks/diffFuse/useDiff';
import { useMergeQuery } from '../hooks/diffFuse/useMergeQuery';
import DiffNodeView from './diffPanel/DiffNodeView';
import { Card } from './shared/cards/Card';
import { CardTitle } from './shared/cards/CardTitle';
import { Clipboard, FileDown } from 'lucide-react';

export default function DiffFusePanel() {
    const sessionId = useSessionStore((s) => s.sessionId);

    const arrayStrategies = useDiffFuseStore((s) => s.arrayStrategies);
    const selections = useDiffFuseStore((s) => s.selections);

    const diffReq = React.useMemo(
        () => ({ array_strategies: arrayStrategies }),
        [arrayStrategies]
    );

    // Pass null sessionId and rely on hook's `enabled` to prevent firing
    const diffQuery = useDiff(sessionId, diffReq);
    const mergeQuery = useMergeQuery(sessionId, diffReq, selections);

    if (!sessionId) return null;

    const isMergeReady =
        !diffQuery.isError &&
        !mergeQuery.isError &&
        mergeQuery.data?.merged !== undefined;

    const rightButtons = (
        <>
            <button
                type="button"
                className="button ok"
                onClick={() => mergeQuery.refetch()}  // todo: copy to clipboard
                disabled={!isMergeReady}
            >
                <Clipboard className="icon" />
            </button>

            <button
                type="button"
                className="button ok"
                onClick={() => mergeQuery.refetch()}  // todo: trigger download
                disabled={!isMergeReady}
            >
                <FileDown className="icon" />
            </button>
        </>
    );

    const titleView = (
        <CardTitle
            title="Diff View"
            rightButtons={rightButtons}
        />
    );

    const contentView = diffQuery.isLoading ? (
        <div>Loading diff...</div>
    ) : diffQuery.isError ? (
        <div>Error loading diff: {String(diffQuery.error)}</div>
    ) : (
        <DiffNodeView
            node={diffQuery.data!.root}
            docIds={Object.keys(diffQuery.data!.root.per_doc ?? {})}
            mergedRoot={mergeQuery.data?.merged}
        />
    );

    return (
        <Card title={titleView} defaultOpen={false}>
            {contentView}
        </Card>
    );
}