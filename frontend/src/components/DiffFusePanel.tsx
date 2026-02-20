import React from 'react';
import { useParams } from 'react-router-dom';
import { useDiffFuseStore } from '../state/diffFuseStore';
import { useDiff } from '../hooks/diffFuse/useDiff';
import { useMergeQuery } from '../hooks/diffFuse/useMergeQuery';
import DiffNodeView from './diffPanel/DiffNodeView';
import { Card } from './shared/cards/Card';
import { CardTitle } from './shared/cards/CardTitle';
import { Clipboard, FileDown } from 'lucide-react';

export default function DiffFusePanel() {
    const { sessionId } = useParams();
    const sid = sessionId ?? null;

    if (!sid) return null;

    // Pull session-scoped state from store
    const per = useDiffFuseStore((s) => s.bySessionId[sid] ?? { arrayStrategies: {}, selections: {} });
    const ensure = useDiffFuseStore((s) => s.ensure);

    React.useEffect(() => {
        ensure(sid);
    }, [sid, ensure]);

    const diffReq = React.useMemo(() => ({ array_strategies: per.arrayStrategies }), [per.arrayStrategies]);

    const diffQuery = useDiff(sid, diffReq);
    const mergeQuery = useMergeQuery(sid, diffReq, per.selections);

    const isMergeReady = !diffQuery.isError && !mergeQuery.isError && mergeQuery.data?.merged !== undefined;


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
            title="Diff Fuse"
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