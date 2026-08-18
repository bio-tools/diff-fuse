/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * How JSON null is interpreted when comparing documents.
 *
 * Attributes
 * ----------
 * missing : str
 * A JSON null means "no value", exactly like an absent key. A document
 * holding null does not take part in the type comparison at that node, so
 * null never conflicts with another type. Examples, for values across
 * documents:
 * - null, absent -> `same` (both say "no value")
 * - null, absent, 2 -> `missing` (one real value, some documents lack it)
 * - null, absent, 2, "pew" -> `type_error` (two real types conflict)
 * value : str
 * A JSON null is an ordinary value of type "null". Comparing it against
 * any other type produces a `type_error`.
 */
export enum NullMode {
    MISSING = 'missing',
    VALUE = 'value',
}
