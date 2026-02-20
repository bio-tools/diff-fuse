/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentFormat } from './DocumentFormat';
/**
 * Full per-document processing result.
 *
 * This model is stored inside sessions and represents the outcome of
 * parsing and normalization. It is the canonical internal representation
 * used by the operations.
 *
 * Attributes
 * ----------
 * raw : str
 * The original raw document content.
 * normalized : Any | None
 * Parsed and normalized document content when ``ok=True``.
 * The structure is backend-defined and treated as opaque by the API.
 *
 * Notes
 * -----
 * - When ``ok=False``, ``normalized`` is typically ``None``.
 */
export type DocumentResult = {
    /**
     * Stable id provided by client (e.g., uuid).
     */
    doc_id: string;
    /**
     * Display name shown in the UI.
     */
    name: string;
    /**
     * Declared document format.
     */
    format?: DocumentFormat;
    /**
     * Whether the document parsed successfully.
     */
    ok: boolean;
    /**
     * Parse/validation error message when ok=False.
     */
    error?: (string | null);
    raw: string;
    normalized?: null;
};

