/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Manual override merge selection.
 *
 * This selection mode indicates that the value for a node should be overridden
 * with a user-provided literal.
 *
 * Attributes
 * ----------
 * kind : Literal["manual"]
 * Discriminator for manual override selection.
 * manual_value : Any
 * Literal value to use for this node. Must be JSON-serializable.
 */
export type ManualMergeSelection = {
    kind?: string;
    /**
     * Required when kind='manual'. May be null.
     */
    manual_value: any;
};

