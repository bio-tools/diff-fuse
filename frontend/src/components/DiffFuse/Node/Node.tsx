/**
 * Recursive diff-tree node renderer.
 *
 * Responsibilities
 * ----------------
 * - resolve the effective user selection for this node
 * - render array strategy controls for array nodes
 * - render per-document values and editable merged value for this node
 * - recurse into children using the already-resolved merged subtree
 *
 * Notes
 * -----
 * `mergedHere` is the merged value for the current node, not necessarily the
 * full merged document.
 */

import type { ArrayStrategy, DiffNode } from "../../../api/generated";
import { DiffStatus, NodeKind } from "../../../api/generated";
import { useDiffFuseStore } from "../../../state/diffFuseStore";
import type { ResolvedRefByNodeId } from "../../../utils/mergedNodeRef";
import { isDocSelection, isManualSelection } from "../../../utils/mergeSelection";
import { getEffectiveSelectionByNodeId } from "../../../utils/nodeIndex";
import { ArrayStrategyControl } from "./ArrayStrategyControl";
import { DiffRow } from "./DiffRow";
import { NodeChildren } from "./NodeChildren";
import { NodeLeafCols } from "./NodeLeafCols";
import { NodeTitle } from "./NodeTitle";
import { shouldShowNode, type DiffVisibilityMode } from "../diffVisibility";


const ROOT = "<root>";

/**
 * Convert a per-document value into a compact display string for the UI.
 */
function renderValue(v: any) {
    if (v === undefined) return "-";
    if (v === null) return "null";
    if (typeof v === "string") return v;
    return JSON.stringify(v, null, 2);
}

/**
 * Build the tree-drawing prefix used for visual indentation.
 *
 * Example output:
 * - "├─ "
 * - "└─ "
 * - "│ ├─ "
 */
function treePrefixFromParts(parts: boolean[], isLast: boolean) {
    // parts tells you for each ancestor whether to draw "│ " or "  "
    const stem = parts
        .slice(0, -1)
        .map((cont) => (cont ? "│ " : "  "))
        .join("");

    const branch = parts.length === 0 ? "" : isLast ? "└─" : "├─";
    return stem + (branch ? branch + " " : "");
}

/**
 * Render one diff node and its subtree.
 *
 * Selection handling
 * ------------------
 * This component resolves the effective selection by consulting explicit
 * selections on the node and its ancestors via the derived node index.
 *
 * Merged value handling
 * ---------------------
 * `mergedHere` is already the merged value for this exact node. Child nodes
 * receive their own merged value via `NodeChildren`.
 */
export function Node({
    node,
    docIds,
    mergedHere,
    resolvedRefByNodeId,
    sessionId,
    visibilityMode,
    prefixParts = [],
    isLast = true,
}: {
    node: DiffNode;
    docIds: string[];
    mergedHere: any;
    resolvedRefByNodeId: ResolvedRefByNodeId;
    sessionId: string;
    visibilityMode: DiffVisibilityMode;
    prefixParts?: boolean[];
    isLast?: boolean;
}) {
    const per = useDiffFuseStore(
        (s) =>
            s.bySessionId[sessionId] ?? {
                arrayStrategiesByNodeId: {},
                selectionsByNodeId: {},
                nodeIndex: {},
            }
    );

    const selections = per.selectionsByNodeId;
    const arrayStrategiesByNodeId = per.arrayStrategiesByNodeId;
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

    // A node may inherit a selection from an ancestor if it has no explicit local selection.
    const eff = getEffectiveSelectionByNodeId(selections, nodeIndex, node.node_id);
    const sel = eff?.sel;

    const selectedDocId = isDocSelection(sel) ? (sel.doc_id ?? null) : null;
    const selectedManualValue = isManualSelection(sel) ? sel.manual_value : undefined;

    const setArrayStrategy = useDiffFuseStore((s) => s.setArrayStrategy);
    const onChangeArrayStrategy = (st: ArrayStrategy) => {
        setArrayStrategy(sessionId, node.node_id, st);
    };

    const isArray = node.kind === NodeKind.ARRAY;
    const title = node.path == "" ? ROOT : node.path;
    const prefix = treePrefixFromParts(prefixParts, isLast);

    if (!shouldShowNode(node, visibilityMode)) {
        return null;
    }

    const right = isArray ? (
        <ArrayStrategyControl
            sessionId={sessionId}
            nodeId={node.node_id}
            strategy={arrayStrategiesByNodeId[node.node_id]}
            onChange={onChangeArrayStrategy}
        />
    ) : null;

    // The root node is structural only; we render its children directly.
    // const showOnlyChildren = title === "";
    const showOnlyChildren = false;

    // Type-error nodes should not render selectable/editable leaf columns,
    // because the merged value is not meaningful there.
    const shouldShowLeafCols = node.status !== DiffStatus.TYPE_ERROR;

    if (showOnlyChildren) {
        return (
            <NodeChildren
                node={node}
                docIds={docIds}
                mergedHere={mergedHere}
                resolvedRefByNodeId={resolvedRefByNodeId}
                sessionId={sessionId}
                visibilityMode={visibilityMode}
                prefixParts={prefixParts}
            />
        );
    }

    return (
        <DiffRow
            title={<NodeTitle title={title} prefix={prefix} status={node.status} rightButtons={right} />}
            defaultOpen={title === ROOT}
        >
            {shouldShowLeafCols && (
                <NodeLeafCols
                    node={node}
                    docIds={docIds}
                    mergedValue={mergedHere}
                    selectedDocId={selectedDocId}
                    selectedManualValue={selectedManualValue}
                    onSelectDoc={onSelectDoc}
                    onSelectManual={onSelectManual}
                    renderValue={renderValue}
                />
            )}

            <NodeChildren
                node={node}
                docIds={docIds}
                mergedHere={mergedHere}
                resolvedRefByNodeId={resolvedRefByNodeId}
                sessionId={sessionId}
                visibilityMode={visibilityMode}
                prefixParts={prefixParts}
            />
        </DiffRow>
    );
}
