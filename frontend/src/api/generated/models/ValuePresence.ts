/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Per-document presence/value information for a single node.
 *
 * This structure answers: for a given diff node (identified by its canonical
 * path), what does each document contain?
 *
 * Attributes
 * ----------
 * present : bool
 * Whether the node/path exists in the document.
 * - False means the key/path does not exist.
 * - True means the key/path exists (even if the value is JSON null).
 * value : Any | None
 * The value at the node, when embedded in the response.
 * Interpretation rules:
 * - present=False always means "missing" regardless of `value`.
 * - present=True and value=None can mean either:
 * (a) the value is JSON null, or
 * (b) the backend intentionally omitted a container value (object/array)
 * to keep payloads small.
 * Use `value_type` and the node's `kind` to interpret `None` correctly.
 * value_type : JsonType | None
 * Normalized JSON type label for the value.
 * - When present=False, this is typically None.
 * - When present=True, this is one of the JsonType literals.
 *
 * Notes
 * -----
 * Implementations commonly omit `value` for container nodes (object/array).
 */
export type ValuePresence = {
    present: boolean;
    value?: null;
    /**
     * Normalized JSON type label.
     */
    value_type?: ('object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | null);
};

