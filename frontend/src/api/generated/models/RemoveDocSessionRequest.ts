/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request payload for removing a document from an existing session.
 *
 * Attributes
 * ----------
 * doc_id : str
 * Document ID to remove from the session. Document ID must correspond
 * to one previously added to the session.
 *
 * Notes
 * -----
 * Removing documents updates the session state and may affect subsequent
 * diff and merge operations. Clients should ensure that removed document
 * IDs are not referenced in future requests.
 */
export type RemoveDocSessionRequest = {
    /**
     * Document ID to remove from the session
     */
    doc_id: string;
};

