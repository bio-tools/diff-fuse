import type { DiffNode, ArrayStrategy } from '../../../api/generated';
import { NodeKind } from '../../../api/generated';
import { useDiffFuseStore } from '../../../state/diffFuseStore';
import { getAtPath } from '../../../utils/jsonPath';
import { NodeTitle } from './NodeTitle';
import { NodeLeafCols } from "./NodeLeafCols";
import { NodeChildren } from "./NodeChildren";
import { ArrayStrategyControl } from "./ArrayStrategyControl";
import { DiffRow } from "./DiffRow";
import { getEffectiveSelectionByNodeId } from '../../../utils/nodeIndex';

function renderValue(v: any) {
    if (v === undefined) return '-';
    if (v === null) return 'null';
    if (typeof v === 'string') return v;
    return JSON.stringify(v, null, 2);
}

function treePrefixFromParts(parts: boolean[], isLast: boolean) {
    // parts tells you for each ancestor whether to draw "│ " or "  "
    const stem = parts
        .slice(0, -1)
        .map((cont) => (cont ? "│ " : "  "))
        .join("");

    const branch = parts.length === 0 ? "" : (isLast ? "└─" : "├─");
    return stem + (branch ? branch + " " : "");
}

export function Node({ node, docIds, mergedRoot, sessionId, prefixParts = [], isLast = true }: {
    node: DiffNode;
    docIds: string[];
    mergedRoot: any;
    sessionId: string;
    prefixParts?: boolean[];
    isLast?: boolean;
}) {
    const per = useDiffFuseStore((s) =>
        s.bySessionId[sessionId] ?? {
            arrayStrategiesByPath: {},
            selectionsByNodeId: {},
            nodeIndex: {},
        }
    );

    const selections = per.selectionsByNodeId;
    const arrayStrategiesByPath = per.arrayStrategiesByPath;
    const nodeIndex = per.nodeIndex;

    const selectDoc = useDiffFuseStore((s) => s.selectDocSmart);
    const selectManual = useDiffFuseStore((s) => s.selectManualSmart);
    const clearSelectionsUnder = useDiffFuseStore((s) => s.clearSelectionsUnder);

    const onSelectDoc = (nodeId: string, docId: string) => {
        clearSelectionsUnder(sessionId, nodeId);
        selectDoc(sessionId, nodeId, docId);
    };

    const onSelectManual = (nodeId: string, value: any) => {
        clearSelectionsUnder(sessionId, nodeId);
        selectManual(sessionId, nodeId, value);
    };

    const eff = getEffectiveSelectionByNodeId(selections, nodeIndex, node.node_id);
    const sel = eff?.sel;

    const selectedDocId = sel?.kind === "doc" ? sel.doc_id ?? null : null;
    const selectedManualValue = sel?.kind === "manual" ? sel.manual_value : undefined;

    // debug
    const selectionSourceNodeId = eff?.atNodeId ?? null;
    const isInherited = selectionSourceNodeId !== null && selectionSourceNodeId !== node.node_id;

    const setArrayStrategy = useDiffFuseStore((s) => s.setArrayStrategy);
    const onChangeArrayStrategy = (st: ArrayStrategy) => {
        setArrayStrategy(sessionId, node.path, st);
    };

    const isArray = node.kind === NodeKind.ARRAY;
    const title = node.path;
    const prefix = treePrefixFromParts(prefixParts, isLast);

    const right = isArray ? (
        <ArrayStrategyControl
            strategy={arrayStrategiesByPath[node.path]}
            onChange={onChangeArrayStrategy}
        />
    ) : null;

    const mergedValue = mergedRoot ? getAtPath(mergedRoot, node.path) : undefined;

    const showOnlyChildren = (title === '');
    // const dontShowValue = node.kind === NodeKind.OBJECT || node.kind === NodeKind.ARRAY;
    const dontShowValue = false;

    if (showOnlyChildren) {
        return (
            <NodeChildren node={node} docIds={docIds} mergedRoot={mergedRoot} sessionId={sessionId} prefixParts={prefixParts} />
        );
    }

    return (
        <DiffRow
            title={<NodeTitle title={title} prefix={prefix} status={node.status} rightButtons={right} />}
            defaultOpen={false}
        >
            {!dontShowValue && (
                <NodeLeafCols
                    node={node}
                    docIds={docIds}
                    mergedValue={mergedValue}
                    selectedDocId={selectedDocId}
                    selectedManualValue={selectedManualValue}
                    onSelectDoc={onSelectDoc}
                    onSelectManual={onSelectManual}
                    renderValue={renderValue}
                />
            )}

            <NodeChildren node={node} docIds={docIds} mergedRoot={mergedRoot} sessionId={sessionId} prefixParts={prefixParts} />
        </DiffRow>
    );
}
