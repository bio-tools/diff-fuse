/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentFormat } from './DocumentFormat';
/**
 * Lightweight document status for API responses.
 *
 * This model is returned to clients to report whether each document
 * was successfully parsed and normalized.
 *
 * Attributes
 * ----------
 * ok : bool
 * Whether parsing and normalization succeeded.
 * error : str | None
 * Human-readable error message when ``ok=False``.
 */
export type DocumentMeta = {
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
};

