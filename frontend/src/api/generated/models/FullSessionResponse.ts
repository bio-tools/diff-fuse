/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentResult } from './DocumentResult';
/**
 * Extended session response including the full session state.
 */
export type FullSessionResponse = {
    session_id: string;
    created_at: string;
    updated_at: string;
    documents_results?: Array<DocumentResult>;
};

