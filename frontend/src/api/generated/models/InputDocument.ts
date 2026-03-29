/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentFormat } from './DocumentFormat';
/**
 * Client-supplied document payload.
 *
 * This model represents the raw document submitted by the client for
 * operations.
 *
 * Attributes
 * ----------
 * content : str
 * Raw document text. Parsing and normalization are performed later
 * during session processing.
 */
export type InputDocument = {
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
     * Raw document text.
     */
    content: string;
};

