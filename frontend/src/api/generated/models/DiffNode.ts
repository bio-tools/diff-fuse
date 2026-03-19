/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArrayMeta } from './ArrayMeta';
import type { ArraySelector } from './ArraySelector';
import type { DiffStatus } from './DiffStatus';
import type { NodeKind } from './NodeKind';
import type { ValuePresence } from './ValuePresence';
/**
 * Node in the diff tree.
 *
 * Each node corresponds to a canonical path and describes:
 * - structural kind (scalar/object/array)
 * - diff status (same/diff/missing/type_error)
 * - per-document presence/value information
 * - child nodes for object/array structures
 *
 * Attributes
 * ----------
 * node_id : str
 * Stable opaque ID for this node (safe identifier).
 * parent_id : str | None
 * Stable opaque ID of the parent node. Root uses None.
 * path : str
 * Canonical path identifier (e.g., ``"a.b[0].c"``). The root path is ``""``.
 * key : str | None
 * Key for object nodes, or None for the root and array nodes. This is used for display purposes.
 * kind : NodeKind
 * Structural kind of the node.
 * status : DiffStatus
 * Diff status of the node.
 * message : str | None
 * Optional explanation, typically used when `status == "type_error"`.
 * Example messages:
 * - ``"type mismatch at 'x': number vs string"``
 * - ``"Keyed mode requires 'key' at array path 'items'"``
 * per_doc : dict[str, ValuePresence]
 * Mapping from ``doc_id`` to per-document presence/value information at this node.
 * children : list[DiffNode]
 * Child nodes for object and array nodes.
 * Ordering guarantees:
 * - Object children are sorted by object key.
 * - Array children ordering depends on the applied array strategy (e.g., index
 * ascending or stable keyed ordering).
 * array_meta : ArrayMeta | None
 * Present only for array nodes, to surface array strategy configuration.
 * parent_path : str | None
 * Canonical path of the parent node. The root node has `parent_path = None`.
 * array_selector : ArraySelector | None
 * For array element nodes, describes how this element was selected/aligned across documents.
 *
 * Notes
 * -----
 * - Container nodes generally omit embedded values in `per_doc[*].value`.
 */
export type DiffNode = {
    /**
     * Stable opaque id for this node (safe identifier).
     */
    node_id: string;
    /**
     * Stable opaque id of the parent node. Root uses None.
     */
    parent_id?: (string | null);
    /**
     * Display path. Do not use for identity.
     */
    path: string;
    /**
     * Display key/label.
     */
    key: (string | null);
    kind: NodeKind;
    status: DiffStatus;
    /**
     * Explanation for type errors or strategy failures.
     */
    message?: (string | null);
    /**
     * Map doc_id -> presence/value at this node/path.
     */
    per_doc: Record<string, ValuePresence>;
    children?: Array<DiffNode>;
    array_meta?: (ArrayMeta | null);
    /**
     * Canonical parent path. Root uses None.
     */
    parent_path?: (string | null);
    /**
     * For array element nodes only: describes the selector used.
     */
    array_selector?: (ArraySelector | null);
};

