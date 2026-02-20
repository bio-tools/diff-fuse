/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InputDocument } from './InputDocument';
/**
 * Request payload for creating a new session
 * or adding documents to an existing session.
 *
 * A session stores the provided documents server-side and returns a
 * ``session_id`` that can be used to compute diffs, apply merges,
 * request array key suggestions, and export results without resending
 * document content.
 *
 * Attributes
 * ----------
 * documents : list[InputDocument]
 * The set of input documents to store in the session.
 * Constraints:
 * - Must contain at least one document (N-way comparisons, N ≥ 1).
 * - Each document must include a stable ``doc_id`` that the client
 * will later reference in merge selections.
 *
 * Notes
 * -----
 * Documents are parsed and normalized during session creation so that
 * subsequent operations can reuse cached results efficiently.
 */
export type AddDocsSessionRequest = {
    documents: Array<InputDocument>;
};

