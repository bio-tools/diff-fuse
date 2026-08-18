/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Diff status for a node.
 *
 * Only `same` means "no difference". The other three are all differences and
 * are presented as such; they record *why* the documents differ, which
 * determines whether the merge can resolve the node on its own.
 *
 * Attributes
 * ----------
 * same : str
 * All documents that contain this node agree on the value, and no document
 * is missing the node. Auto-resolvable.
 * diff : str
 * At least two documents contain this node but disagree on its value.
 * All present values share the same JSON type. Needs a selection.
 * missing : str
 * At least one document has no value at this node/path, but all documents
 * that do have one agree on it. Auto-resolvable: the real value wins.
 * What counts as "no value" depends on the effective `NullMode`:
 * - under `NullMode.missing` (default), an absent key and a JSON null are
 * both "no value" and are treated identically
 * - under `NullMode.value`, only an absent key is "no value"; a JSON null
 * is an ordinary value of type "null"
 * type_error : str
 * The documents hold incompatible shapes, so their values cannot be
 * compared element by element. Needs a selection.
 * Example scenarios:
 * - One document has an object while another has a string at the same path.
 * - An array strategy is invalid for the actual array contents (e.g. keyed
 * strategy but elements are not objects).
 *
 * Notes
 * -----
 * `type_error` is aggregated upward by `_status_from_children`, so every
 * ancestor of an incompatible node reports it too. Only the *originating* node
 * is childless, carries a `message`, and embeds its per-document values; a
 * propagated one is an ordinary container node that still merges by recursion.
 */
export enum DiffStatus {
    SAME = 'same',
    DIFF = 'diff',
    MISSING = 'missing',
    TYPE_ERROR = 'type_error',
}
