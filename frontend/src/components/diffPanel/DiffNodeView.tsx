import React from 'react';
import type { DiffNode } from '../../api/generated';
import { NodeKind, ArrayStrategyMode } from '../../api/generated';
import { useDiffFuseStore } from '../../state/diffFuseStore';
import { getAtPath } from '../../utils/jsonPath';
import { NodeTitle } from './NodeTitle';
import { DiffNodeLeafColumns } from "./DiffNodeLeafColumns";
import { DiffNodeChildren } from "./DiffNodeChildren";
import { ArrayStrategyControl } from "./ArrayStrategyControl";
import { DiffRow } from "./DiffRow";
import { Diff } from 'lucide-react';

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
}: {
    node: DiffNode;
    docIds: string[];
    mergedRoot: any;
}) {
    const selections = useDiffFuseStore((s) => s.selections);
    const selectDoc = useDiffFuseStore((s) => s.selectDoc);

    const arrayStrategies = useDiffFuseStore((s) => s.arrayStrategies);
    const setArrayStrategy = useDiffFuseStore((s) => s.setArrayStrategy);

    const isArray = node.kind === NodeKind.ARRAY;
    const title = node.path;

    const right = isArray ? (
        <ArrayStrategyControl
            path={node.path}
            strategy={arrayStrategies[node.path]}
            onChange={(st) => setArrayStrategy(node.path, st)}
        />
    ) : null;

    const mergedValue = mergedRoot ? getAtPath(mergedRoot, node.path) : undefined;

    const selected = selections[node.path]?.kind === 'doc' ? selections[node.path]?.doc_id : null;

    const showOnlyChildren = (title === '');
    const dontShowValue = node.kind === NodeKind.OBJECT || node.kind === NodeKind.ARRAY;

    if (showOnlyChildren) {
        return (
            <DiffNodeChildren node={node} docIds={docIds} mergedRoot={mergedRoot} />
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
                    onSelectDoc={selectDoc}
                    renderValue={renderValue}
                />
            )}

            <DiffNodeChildren node={node} docIds={docIds} mergedRoot={mergedRoot} />
        </DiffRow>
    );
}
