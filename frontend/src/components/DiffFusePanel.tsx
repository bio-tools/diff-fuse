import React from 'react';
import { useSessionStore } from '../state/sessionStore';
import { useDiffFuseStore } from '../state/diffFuseStore';
import { useDiff } from '../hooks/diffFuse/useDiff';
import { useMergeQuery } from '../hooks/diffFuse/useMergeQuery';
import DiffNodeView from './DiffNodeView';
import { Card } from './shared/cards/Card';
import { CardTitle } from './shared/cards/CardTitle';

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

    const titleView = CardTitle({
        title: 'Diff Fuse',
        rightButtons: right,
    });

    const contentView = diffQuery.isLoading ? (
        <div>Loading...</div>
    ) : diffQuery.isError ? (
        <div style={{ color: '#b00' }}>
            Error loading diff: {String(diffQuery.error)}
        </div>
    ) : (
        <DiffNodeView
            node={diffQuery.data!.root}
            docIds={Object.keys(diffQuery.data!.root.per_doc ?? {})}
            mergedRoot={mergeQuery.data?.merged}
        />
    );

    return Card({
        title: titleView,
        children: contentView,
        defaultOpen: false,
    });
}