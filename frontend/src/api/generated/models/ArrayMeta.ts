/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArrayStrategy } from './ArrayStrategy';
/**
 * Extra metadata attached to array nodes.
 *
 * Attributes
 * ----------
 * strategy : ArrayStrategy
 * The effective array strategy applied at this array node.
 *
 * Notes
 * -----
 * This is only included when `DiffNode.kind == NodeKind.array`.
 */
export type ArrayMeta = {
    strategy: ArrayStrategy;
};

