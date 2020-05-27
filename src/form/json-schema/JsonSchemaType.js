/**
 * Module specifying the values that the `type` generic validation keyword can
 * take.
 *
 * @module JsonSchemaType
 *
 * @see {@link https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.6.1.1}
 */

/**
 * List of JSON types defined by the JSON Schema specification.
 *
 * @enum {string}
 */
const JsonSchemaType = {
  ARRAY: 'array',
  BOOLEAN: 'boolean',
  INTEGER: 'integer',
  NULL: 'null',
  NUMBER: 'number',
  OBJECT: 'object',
  STRING: 'string',
};

export default JsonSchemaType;
