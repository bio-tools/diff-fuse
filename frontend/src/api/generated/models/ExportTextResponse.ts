/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response payload for text-based export.
 *
 * Attributes
 * ----------
 * text : str
 * Serialized merged document (typically JSON).
 *
 * unresolved_paths : list[str]
 * Canonical paths that remained unresolved during merge.
 * Interpretation:
 * - Empty list -> fully resolved export.
 * - Non-empty -> export was best-effort (unless strict mode
 * prevented it).
 *
 * Notes
 * -----
 * This response is primarily intended for clipboard workflows. File
 * downloads typically use a binary response instead.
 */
export type ExportTextResponse = {
    unresolved_paths?: Array<string>;
    text: string;
};

