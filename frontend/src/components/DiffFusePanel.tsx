import React from 'react';
import Collapsible from './Collapsible';
import { useSessionStore } from '../state/sessionStore';
import { useDiffFuseStore } from '../state/diffFuseStore';
import { useDiff } from '../hooks/diffFuse/useDiff';
import { useMergeQuery } from '../hooks/diffFuse/useMergeQuery';
import DiffNodeView from './DiffNodeView';

export default function DiffFusePanel() {
    const sessionId = useSessionStore((s) => s.sessionId);

    const arrayStrategies = useDiffFuseStore((s) => s.arrayStrategies);
    const selections = useDiffFuseStore((s) => s.selections);

    if (!sessionId) return null;

    const diffReq = React.useMemo(() => ({ array_strategies: arrayStrategies }), [arrayStrategies]);

    const diffQuery = useDiff(sessionId, diffReq);
    const mergeQuery = useMergeQuery(sessionId, diffReq, selections);

    const right = (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ opacity: 0.7 }}>
                diff: {diffQuery.isFetching ? '…' : diffQuery.isError ? 'error' : 'ok'}
            </span>
            <span style={{ opacity: 0.7 }}>
                merge: {mergeQuery.isFetching ? '…' : mergeQuery.isError ? 'error' : 'ok'}
            </span>
        </div>
    );

    return (
        <Collapsible title="diff-fuse" right={right} defaultOpen>
            {diffQuery.isLoading ? (
                <p>Computing diff…</p>
            ) : diffQuery.isError ? (
                <p>Diff failed.</p>
            ) : (
                <DiffNodeView
                    node={diffQuery.data!.root}
                    docIds={Object.keys(diffQuery.data!.root.per_doc ?? {})}
                    mergedRoot={mergeQuery.data?.merged}
                />
            )}
        </Collapsible>
    );
}