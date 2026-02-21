import React from 'react';
import { useSessionId } from '../hooks/session/useSessionId';
import { useDiffFuseStore } from '../state/diffFuseStore';
import { useDiff } from '../hooks/diffFuse/useDiff';
import { useMergeQuery } from '../hooks/diffFuse/useMergeQuery';
import DiffNodeView from './diffPanel/DiffNodeView';
import { Card } from './shared/cards/Card';
import { CardTitle } from './shared/cards/CardTitle';
import { Clipboard, FileDown } from 'lucide-react';

const EMPTY_PER = { arrayStrategies: {}, selections: {} } as const;

export default function DiffFusePanel() {
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
                onClick={() => mergeQuery.refetch()}
                disabled={!isMergeReady}
            >
                <Clipboard className="icon" />
            </button>

            <button
                type="button"
                className="button ok"
                onClick={() => mergeQuery.refetch()}
                disabled={!isMergeReady}
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
        <DiffNodeView
            node={diffQuery.data!.root}
            docIds={Object.keys(diffQuery.data!.root.per_doc ?? {})}
            mergedRoot={mergeQuery.data?.merged}
            sessionId={sessionId}
        />
    );

    return (
        <Card title={<CardTitle title="Diff Fuse" rightButtons={rightButtons} />} defaultOpen={false}>
            {contentView}
        </Card>
    );
}