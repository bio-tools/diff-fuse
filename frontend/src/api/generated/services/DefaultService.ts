/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddDocsSessionRequest } from '../models/AddDocsSessionRequest';
import type { DiffRequest } from '../models/DiffRequest';
import type { DiffResponse } from '../models/DiffResponse';
import type { ExportRequest } from '../models/ExportRequest';
import type { ExportTextResponse } from '../models/ExportTextResponse';
import type { FullSessionResponse } from '../models/FullSessionResponse';
import type { MergeRequest } from '../models/MergeRequest';
import type { MergeResponse } from '../models/MergeResponse';
import type { RemoveDocSessionRequest } from '../models/RemoveDocSessionRequest';
import type { SessionResponse } from '../models/SessionResponse';
import type { SuggestArrayKeysRequest } from '../models/SuggestArrayKeysRequest';
import type { SuggestArrayKeysResponse } from '../models/SuggestArrayKeysResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Create
     * Create a new session.
     *
     * This endpoint stores the provided documents server-side and returns
     * a `session_id` that can be used for subsequent operations such as:
     *
     * - diff computation
     * - merge resolution
     * - array key suggestions
     * - export
     *
     * Parameters
     * ----------
     * req : AddDocsSessionRequest
     * Session creation payload containing the input documents.
     *
     * Returns
     * -------
     * SessionResponse
     * Contains the generated `session_id` and document metadata.
     *
     * Notes
     * -----
     * - Document parsing errors (if any) are captured in the stored
     * `DocumentResult` objects and surfaced in later operations.
     * @param requestBody
     * @returns SessionResponse Successful Response
     * @throws ApiError
     */
    public static createPost(
        requestBody: AddDocsSessionRequest,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Docs
     * Add documents to an existing session.
     *
     * This endpoint allows clients to append new documents to an existing
     * session. The new documents are parsed, normalized, and stored
     * alongside the existing ones.
     *
     * Parameters
     * ----------
     * session_id : str
     * Target session identifier.
     * req : AddDocsSessionRequest
     * Request payload containing the new documents to add.
     *
     * Returns
     * -------
     * SessionResponse
     * Updated session metadata after adding the new documents.
     *
     * Notes
     * -----
     * This operation mutates the session by appending new documents. The
     * existing documents remain unchanged.
     * @param sessionId
     * @param requestBody
     * @returns SessionResponse Successful Response
     * @throws ApiError
     */
    public static addDocsSessionIdAddDocsPost(
        sessionId: string,
        requestBody: AddDocsSessionRequest,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{session_id}/add-docs',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove Doc
     * Remove a document from an existing session.
     *
     * This endpoint allows clients to remove a specific document from an
     * existing session by its `doc_id`. The session's stored documents are
     * updated accordingly.
     *
     * Parameters
     * ----------
     * session_id : str
     * Target session identifier.
     * req : RemoveDocSessionRequest
     * Request payload containing the `doc_id` of the document to remove.
     *
     * Returns
     * -------
     * SessionResponse
     * Updated session metadata after removing the specified document.
     *
     * Notes
     * -----
     * - This operation mutates the session by removing the specified document. The
     * remaining documents remain unchanged.
     * @param sessionId
     * @param requestBody
     * @returns SessionResponse Successful Response
     * @throws ApiError
     */
    public static removeDocSessionIdRemoveDocPost(
        sessionId: string,
        requestBody: RemoveDocSessionRequest,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{session_id}/remove-doc',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Docs Meta
     * List metadata for all documents in a session.
     *
     * Parameters
     * ----------
     * session_id : str
     * Target session identifier.
     *
     * Returns
     * -------
     * SessionResponse
     * Session metadata including document metadata for all documents in the session.
     * @param sessionId
     * @returns SessionResponse Successful Response
     * @throws ApiError
     */
    public static listDocsMetaSessionIdDocsMetaGet(
        sessionId: string,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{session_id}/docs-meta',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Full Session State
     * Retrieve the full session state, including all documents and their parse results.
     *
     * Parameters
     * ----------
     * session_id : str
     * Target session identifier.
     *
     * Returns
     * -------
     * FullSessionResponse
     * Contains the complete session state, including all documents and their parse results.
     *
     * Notes
     * -----
     * This endpoint is primarily intended for debugging and development purposes,
     * as it may return large payloads depending on the number and size of documents in the session.
     * @param sessionId
     * @returns FullSessionResponse Successful Response
     * @throws ApiError
     */
    public static getFullSessionStateSessionIdFullGet(
        sessionId: string,
    ): CancelablePromise<FullSessionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{session_id}/full',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Diff
     * Compute the diff tree for a session.
     *
     * This endpoint builds a structural diff across all documents stored in
     * the specified session. The result is a hierarchical tree of `DiffNode`
     * objects that the UI can render side-by-side.
     *
     * Parameters
     * ----------
     * session_id : str
     * Identifier of the session containing the documents to compare.
     * req : DiffRequest
     * Diff configuration payload, containing per-array
     * matching strategies.
     *
     * Returns
     * -------
     * DiffResponse
     * The computed diff tree rooted at the document root.
     *
     * Raises
     * ------
     * DomainError
     * If the session does not exist or has expired.
     *
     * Notes
     * -----
     * - The diff is recomputed on each call using cached normalized documents.
     * - Array handling behavior depends on `array_strategies`.
     * - The returned tree uses stable canonical paths suitable for UI state.
     * @param sessionId
     * @param requestBody
     * @returns DiffResponse Successful Response
     * @throws ApiError
     */
    public static diffSessionIdDiffPost(
        sessionId: string,
        requestBody: DiffRequest,
    ): CancelablePromise<DiffResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{session_id}/diff',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Merge
     * Produce a merged document for a session.
     *
     * This endpoint applies the provided path selections to the session's
     * documents and returns the synthesized merged output. Any unresolved
     * conflicts are reported explicitly.
     *
     * Parameters
     * ----------
     * session_id : str
     * Identifier of the session containing the documents to merge.
     * req : MergeRequest
     * Merge configuration including:
     * - diff configuration (array strategies)
     * - per-path merge selections
     *
     * Returns
     * -------
     * MergeResponse
     * The merged document along with any unresolved conflict paths.
     *
     * Raises
     * ------
     * DomainError
     * If the session does not exist or has expired.
     *
     * Notes
     * -----
     * - Merge behavior is deterministic given the same selections.
     * - Container nodes inherit selections down the tree unless overridden.
     * - Paths listed in `unresolved_paths` require user intervention.
     * @param sessionId
     * @param requestBody
     * @returns MergeResponse Successful Response
     * @throws ApiError
     */
    public static mergeSessionIdMergePost(
        sessionId: string,
        requestBody: MergeRequest,
    ): CancelablePromise<MergeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{session_id}/merge',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Suggest Keys
     * Suggest candidate key fields for an array node within a session.
     *
     * This endpoint analyzes the array located at the provided canonical path
     * across all session documents and returns ranked key candidates that may
     * be suitable for keyed array matching.
     *
     * Parameters
     * ----------
     * session_id : str
     * Identifier of the session containing the documents to analyze.
     * req : SuggestArrayKeysRequest
     * Request containing:
     * - `path`: canonical path to the target array node
     * - `top_k`: maximum number of suggestions to return
     *
     * Returns
     * -------
     * SuggestArrayKeysResponse
     * Ranked list of suggested key fields with scoring metadata.
     *
     * Raises
     * ------
     * DomainError
     * If the session does not exist or has expired.
     * InvalidPath
     * If the provided path is malformed or unsupported.
     *
     * Notes
     * -----
     * - Only arrays of objects are meaningful for key suggestion.
     * - Documents that fail parsing are ignored for suggestion purposes.
     * - Suggestions are heuristic and should be treated as guidance,
     * not guarantees of uniqueness.
     * @param sessionId
     * @param requestBody
     * @returns SuggestArrayKeysResponse Successful Response
     * @throws ApiError
     */
    public static suggestKeysSessionIdArraysSuggestKeysPost(
        sessionId: string,
        requestBody: SuggestArrayKeysRequest,
    ): CancelablePromise<SuggestArrayKeysResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{session_id}/arrays/suggest-keys',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Export Text
     * Return the merged document as formatted text.
     *
     * This endpoint is primarily intended for UI workflows such as:
     * - copy-to-clipboard
     * - inline preview
     * - quick inspection of merge results
     *
     * Parameters
     * ----------
     * session_id : str
     * Identifier of the session containing the documents to merge.
     * req : ExportRequest
     * Export configuration including:
     * - merge request (diff config + selections)
     * - pretty-print preference
     * - conflict requirements
     *
     * Returns
     * -------
     * ExportTextResponse
     * Textual representation of the merged JSON along with any unresolved
     * conflict paths.
     *
     * Raises
     * ------
     * DomainError
     * If the session does not exist or has expired.
     * @param sessionId
     * @param requestBody
     * @returns ExportTextResponse Successful Response
     * @throws ApiError
     */
    public static exportTextSessionIdExportTextPost(
        sessionId: string,
        requestBody: ExportRequest,
    ): CancelablePromise<ExportTextResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{session_id}/export/text',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Export Download
     * Download the merged document as a JSON file.
     *
     * This endpoint returns the merged result as an HTTP attachment suitable
     * for saving to disk.
     *
     * Parameters
     * ----------
     * session_id : str
     * Identifier of the session containing the documents to merge.
     * req : ExportRequest
     * Export configuration controlling merge behavior and formatting.
     *
     * Returns
     * -------
     * Response
     * Binary HTTP response with:
     * - media type: application/json
     * - content-disposition: attachment
     * - body: UTF-8 encoded JSON
     *
     * Raises
     * ------
     * DomainError
     * If the session does not exist or has expired.
     *
     * Notes
     * -----
     * The downloaded JSON is identical to the text export output, aside from
     * transport encoding.
     * @param sessionId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportDownloadSessionIdExportDownloadPost(
        sessionId: string,
        requestBody: ExportRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{session_id}/export/download',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Health
     * Health check endpoint.
     *
     * Returns
     * -------
     * dict[str, str]
     * Minimal health payload. Intended for load balancers and orchestration checks.
     * @returns string Successful Response
     * @throws ApiError
     */
    public static healthHealthGet(): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
}
