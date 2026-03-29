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
 * At least one document is missing this node/path, but all documents that
 * contain it agree on its value.
 * Missingness is tracked separately from JSON null:
 * - missing means the key/path does not exist
 * - null means it exists and the value is JSON null
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
