/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Document-based merge selection.
 *
 * This selection mode indicates that the value for a node should be taken
 * from a specific source document.
 *
 * Attributes
 * ----------
 * kind : Literal["doc"]
 * Discriminator for document-based selection.
 * doc_id : str
 * Identifier of the source document to use for this node.
 */
export type DocMergeSelection = {
    kind?: string;
    /**
     * Required when kind='doc'.
     */
    doc_id: string;
};

