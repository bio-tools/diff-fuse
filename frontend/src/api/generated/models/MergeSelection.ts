/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * User selection describing how to resolve a particular diff path.
 *
 * A selection specifies the source of truth for a node during merge.
 * Two modes are supported:
 * - ``kind="doc"``:
 * Select the value from a specific source document.
 * - ``kind="manual"``:
 * Override the value with a user-provided literal.
 *
 * Selections are applied hierarchically: a selection at path ``"a.b"``
 * applies to all descendants (e.g., ``"a.b.c"``) unless a more specific
 * selection overrides it.
 *
 * Attributes
 * ----------
 * kind : {"doc", "manual"}
 * Resolution mode.
 * doc_id : str | None, default=None
 * Identifier of the source document when ``kind="doc"``.
 * manual_value : Any | None, default=None
 * Literal value to inject when ``kind="manual"``.
 *
 * Notes
 * -----
 * - Validation of whether the selected document actually contains the
 * requested path is performed during merge execution.
 * - Manual values must be JSON-serializable for export operations.
 */
export type MergeSelection = {
    /**
     * Resolution mode: 'doc' or 'manual'.
     */
    kind: MergeSelection.kind;
    /**
     * Required when kind='doc'.
     */
    doc_id?: (string | null);
    /**
     * Required when kind='manual'.
     */
    manual_value?: null;
};
export namespace MergeSelection {
    /**
     * Resolution mode: 'doc' or 'manual'.
     */
    export enum kind {
        DOC = 'doc',
        MANUAL = 'manual',
    }
}

