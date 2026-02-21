import type { DiffNode } from '../../api/generated';
import { NodeKind, ArrayStrategyMode } from '../../api/generated';
import { useDiffFuseStore } from '../../state/diffFuseStore';
import { getAtPath } from '../../utils/jsonPath';
import { NodeTitle } from './NodeTitle';
import { DiffNodeLeafColumns } from "./DiffNodeLeafColumns";
import { DiffNodeChildren } from "./DiffNodeChildren";
import { ArrayStrategyControl } from "./ArrayStrategyControl";
import { DiffRow } from "./DiffRow";

function renderValue(v: any) {
    if (v === undefined) return <span style={{ opacity: 0.6 }}>—</span>;
    if (v === null) return 'null';
    if (typeof v === 'string') return v;
    return <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(v, null, 2)}</pre>;
}

export default function DiffNodeView({
    node,
    docIds,
    mergedRoot,
    sessionId,
}: {
    node: DiffNode;
    docIds: string[];
    mergedRoot: any;
    sessionId: string;
}) {
    const per = useDiffFuseStore((s) => s.bySessionId[sessionId] ?? { arrayStrategies: {}, selections: {} });

    const selectDoc = useDiffFuseStore((s) => s.selectDoc);
    const setArrayStrategy = useDiffFuseStore((s) => s.setArrayStrategy);

    const selections = per.selections;
    const arrayStrategies = per.arrayStrategies;

    const onSelectDoc = (path: string, docId: string) => {
        selectDoc(sessionId, path, docId);
    };
    const onChangeArrayStrategy = (st: ArrayStrategyMode) => {
        setArrayStrategy(sessionId, node.path, st);
    };

    const isArray = node.kind === NodeKind.ARRAY;
    const title = node.path;

    const right = isArray ? (
        <ArrayStrategyControl
            path={node.path}
            strategy={arrayStrategies[node.path]}
            onChange={(st) => onChangeArrayStrategy(st)}
        />
    ) : null;

    const mergedValue = mergedRoot ? getAtPath(mergedRoot, node.path) : undefined;

    const selected = selections[node.path]?.kind === 'doc' ? selections[node.path]?.doc_id : null;

    const showOnlyChildren = (title === '');
    const dontShowValue = node.kind === NodeKind.OBJECT || node.kind === NodeKind.ARRAY;

    if (showOnlyChildren) {
        return (
            <DiffNodeChildren node={node} docIds={docIds} mergedRoot={mergedRoot} sessionId={sessionId} />
        );
    }

    return (
        <DiffRow
            title={<NodeTitle title={title} status={node.status} rightButtons={right} />}
            defaultOpen={false}
        >
            {!dontShowValue && (
                <DiffNodeLeafColumns
                    node={node}
                    docIds={docIds}
                    mergedValue={mergedValue}
                    selectedDocId={selected}
                    onSelectDoc={onSelectDoc}
                    renderValue={renderValue}
                />
            )}

            <DiffNodeChildren node={node} docIds={docIds} mergedRoot={mergedRoot} sessionId={sessionId} />
        </DiffRow>
    );
}
