/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentMeta } from './DocumentMeta';
/**
 * Response payload returned after creating a session.
 *
 * Attributes
 * ----------
 * session_id : str
 * Opaque identifier for the newly created session. Clients should
 * treat this as an opaque token and not infer semantics from its
 * contents.
 * documents_meta : list[DocumentMeta]
 * Metadata describing the stored documents, including their
 * ``doc_id``, display name, declared format, and parse status.
 *
 * Notes
 * -----
 * - Session IDs may expire depending on server configuration (TTL).
 * - Clients should persist the ``session_id`` for subsequent API calls.
 */
export type SessionResponse = {
    session_id: string;
    documents_meta: Array<DocumentMeta>;
};

