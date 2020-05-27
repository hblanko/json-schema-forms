/**
 * Keywords and types specified by the [JSON Schema 2019-09 RFC Draft](https://json-schema.org/draft/2019-09/json-schema-core.html).
 *
 * @module JsonSchemaKeywords
 */

/**
 * Object containing the JSON Schema keywords classified by its role in the
 * schema definition.
 *
 * @enum {object.<string, string>}
 */
const JsonSchemaKeywords = {
  /**
   * Keywords representing [JSON Schema annotations](https://json-schema.org/draft/2019-09/json-schema-core.html#annotations).
   *
   * @enum {string}
   */
  Annotation: {
    DEFAULT: 'default',
    DEPRECATED: 'deprecated',
    DESCRIPTION: 'description',
    EXAMPLES: 'examples',
    READ_ONLY: 'readOnly',
    TITLE: 'title',
    WRITE_ONLY: 'writeOnly',
  },

  /**
   * Keywords representing [JSON Schema applicators for `array` instances](https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.9.3.1).
   *
   * @enum {string}
   */
  ArrayApplicator: {
    ADDITIONAL_ITEMS: 'additionalItems',
    CONTAINS: 'contains',
    ITEMS: 'items',
    UNEVALUATED_ITEMS: 'unevaluatedItems',
  },

  /**
   * Keywords representing [JSON Schema validation conditions for `array`
   * instances](https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.6.4).
   *
   * @enum {string}
   */
  ArrayValidation: {
    MAX_CONTAINS: 'maxContains',
    MAX_ITEMS: 'maxItems',
    MIN_CONTAINS: 'minContains',
    MIN_ITEMS: 'minItems',
    UNIQUE_ITEMS: 'uniqueItems',
  },

  /**
   * Keywords representing [JSON Schema in-place applicators with boolean logic](https://json-schema.org/draft/2019-09/json-schema-core.html#logic).
   *
   * @enum {string}
   */
  BooleanLogicApplicator: {
    ALL_OF: 'allOf',
    ANY_OF: 'anyOf',
    NOT: 'not',
    ONE_OF: 'oneOf',
  },

  /**
   * Keywords representing [JSON Schema in-place applicators conditionally](https://json-schema.org/draft/2019-09/json-schema-core.html#conditional).
   *
   * @enum {string}
   */
  ConditionalApplicator: {
    IF: 'if',
    THEN: 'then',
    ELSE: 'else',
  },

  /**
   * Keywords representing [generic JSON Schema validation conditions](https://json-schema.org/draft/2019-09/json-schema-validation.html#general).
   *
   * @enum {string}
   */
  GenericValidation: {
    CONST: 'const',
    ENUM: 'enum',
    TYPE: 'type',
  },

  /**
   * Keywords representing [JSON Schema validation conditions for numeric
   * (`number` and `integer`) instances](https://json-schema.org/draft/2019-09/json-schema-validation.html#numeric).
   *
   * @enum {string}
   */
  NumberValidation: {
    EXCLUSIVE_MAXIMUM: 'exclusiveMaximum',
    EXCLUSIVE_MINIMUM: 'exclusiveMinimum',
    MAXIMUM: 'maximum',
    MINIMUM: 'minimum',
    MULTIPLE_OF: 'multipleOf',
  },

  /**
   * Keywords representing [JSON Schema applicators for `object` instances](https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.9.3.2).
   *
   * @enum {string}
   */
  ObjectApplicator: {
    ADDITIONAL_PROPERTIES: 'additionalProperties',
    PATTERN_PROPERTIES: 'patternProperties',
    PROPERTIES: 'properties',
    UNEVALUATED_PROPERTIES: 'unevaluatedProperties',
  },

  /**
   * Keywords representing [JSON Schema validation conditions for `object`
   * instances](https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.6.5).
   *
   * @enum {string}
   */
  ObjectValidation: {
    DEPENDENT_REQUIRED: 'dependentRequired',
    MAX_PROPERTIES: 'maxProperties',
    MIN_PROPERTIES: 'minProperties',
    PROPERTY_NAMES: 'propertyNames',
    REQUIRED: 'required',
  },

  /**
   * Keywords representing [JSON Schema validation conditions for `string`
   * instances](https://json-schema.org/draft/2019-09/json-schema-validation.html#string).
   *
   * @enum {string}
   */
  StringValidation: {
    MAX_LENGTH: 'maxLength',
    MIN_LENGTH: 'minLength',
    PATTERN: 'pattern',
  },
};

export default JsonSchemaKeywords;
