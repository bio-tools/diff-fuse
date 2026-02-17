/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArrayMeta } from './ArrayMeta';
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
 * path : str
 * Canonical path identifier (e.g., ``"a.b[0].c"``). The root path is ``""``.
 * key : str | None
 * Final segment of the path used for UI presentation.
 * - object child -> object key
 * - array child  -> array group label
 * - root         -> None
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
 * Mapping from ``doc_id`` to per-document presence/value information at this path.
 * children : list[DiffNode]
 * Child nodes for object and array nodes.
 * Ordering guarantees:
 * - Object children are sorted by object key.
 * - Array children ordering depends on the applied array strategy (e.g., index
 * ascending or stable keyed ordering).
 * array_meta : ArrayMeta | None
 * Present only for array nodes, to surface array strategy configuration.
 *
 * Notes
 * -----
 * - `path` values are unique within the tree and can be used as stable identifiers
 * for selections and UI state.
 * - Container nodes generally omit embedded values in `per_doc[*].value`.
 */
export type DiffNode = {
    /**
     * Canonical path like 'a.b[0].c'. Root is ''.
     */
    path: string;
    /**
     * Last path segment (object key or array element label). Root uses None.
     */
    key?: (string | null);
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
};

