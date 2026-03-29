/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DiffNode } from './DiffNode';
/**
 * Response payload containing the computed diff tree.
 *
 * Attributes
 * ----------
 * root : DiffNode
 * Root of the hierarchical diff tree.
 * The root node has:
 * - ``path == ""``
 * - ``key is None``
 */
export type DiffResponse = {
    root: DiffNode;
};

