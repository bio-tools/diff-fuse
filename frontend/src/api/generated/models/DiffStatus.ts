/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Diff status for a node.
 *
 * Attributes
 * ----------
 * same : str
 * All documents that contain this node agree on the value, and no document
 * is missing the node.
 * diff : str
 * At least two documents contain this node but disagree on its value.
 * All present values share the same JSON type.
 * missing : str
 * At least one document has no value at this node/path, but all documents
 * that do have one agree on it.
 * What counts as "no value" depends on the effective `NullMode`:
 * - under `NullMode.missing` (default), an absent key and a JSON null are
 * both "no value" and are treated identically
 * - under `NullMode.value`, only an absent key is "no value"; a JSON null
 * is an ordinary value of type "null"
 * type_error : str
 * A structural/type-level issue prevents a meaningful value diff at this node.
 * Example scenarios:
 * - One document has an object while another has a string at the same path.
 * - An array strategy is invalid for the actual array contents (e.g. keyed
 * strategy but elements are not objects).
 */
export enum DiffStatus {
    SAME = 'same',
    DIFF = 'diff',
    MISSING = 'missing',
    TYPE_ERROR = 'type_error',
}
