/**
 * Module that analyzes and resolves [JSON Schema in-place applicators](https://json-schema.org/draft/2019-09/json-schema-core.html#in-place).
 *
 * In this approach, the in-place applicators present in a JSON Schema are
 * modeled as a directed tree (where nodes represented by {@link
 * module:inPlaceApplicators~IPASchema} objects). Each node stores the keywords
 * belonging to its corresponding subschema: hence, any possible materialization
 * of a JSON Schema can be reconstructed by aggregating the keywords of each
 * node traversed by any directed path from the root node to the leaf.
 *
 * The user is intended to select the desired path: {@link module:selectors}
 * provides a user interface for this purpose.
 *
 * @module inPlaceApplicators
 */
import JsonSchemaKeywords from './JsonSchemaKeywords.js';

/**
 * Processes a JSON Schema, generating an in-place application tree that
 * represents its possible materializations.
 *
 * @param {object} schema The JSON Schema to process.
 * @param {string} [pointer=''] A JSON Pointer that provides unique
 * identification to each in-place applicator in the JSON Schema.
 * @param {number} [selected=0] The index indicating the applicator subschema to
 * be selected at initialization.
 *
 * @returns {module:inPlaceApplicators~IPASchema} The root node to the in-place
 * application tree that represents the given JSON Schema.
 */
function process(schema, pointer = '', selected = 0) {
  const { common, applicatorByPointer } = schema.allOf
    ? processAllOf(
        schema,
        `${pointer}/${JsonSchemaKeywords.BooleanLogicApplicator.ALL_OF}`
      )
    : {
        common: {
          ...schema,
        },
        applicatorByPointer: new Map(),
      };

  if (schema.anyOf) {
    delete common.anyOf;
    const aop = `${pointer}/${JsonSchemaKeywords.BooleanLogicApplicator.ANY_OF}`;

    applicatorByPointer.set(
      aop,
      new InPlaceApplicator(processAnyOf(schema.anyOf, aop), selected)
    );
  }

  if (schema.oneOf) {
    delete common.oneOf;
    const oop = `${pointer}/${JsonSchemaKeywords.BooleanLogicApplicator.ONE_OF}`;

    applicatorByPointer.set(
      oop,
      new InPlaceApplicator(processOneOf(schema.oneOf, oop), selected)
    );
  }

  return new IPASchema(common, applicatorByPointer);
}

/**
 * @typedef {object} ProcessAllOfResult
 *
 * @property {object} common The keywords that are common to all the `allOf`
 * subschemas.
 * @property {Map.<string, module:inPlaceApplicators~InPlaceApplicator>} applicatorByPointer
 * A map including the child in-place applicators contained by the processed
 * `allOf` applicator.
 */

/**
 * Processes an `allOf` in-place applicator.
 *
 * @param {object} schema The JSON Schema including an `allOf` property to
 * process.
 * @param {string} [pointer=''] A JSON Pointer that identifies the JSON Schema.
 *
 * @returns {module:inPlaceApplicators~ProcessAllOfResult} The result of
 * processing the `allOf` in-place applicator.
 */
function processAllOf(schema, pointer) {
  const ipaSchemas = schema.allOf.map((s, i) => process(s, `${pointer}/${i}`));

  return {
    common: aggregate(schema, ...ipaSchemas),
    applicatorByPointer: new Map(
      ipaSchemas.flatMap((ipaSchema) => [...ipaSchema.applicatorByPointer])
    ),
  };
}

/**
 * Processes an `anyOf` in-place applicator.
 *
 * @param {Array.<object>} subschemas The subschemas included in the `anyOf`
 * in-place applicator.
 * @param {string} [pointer=''] A JSON Pointer that identifies the JSON Schema.
 *
 * @returns {Array.<module:inPlaceApplicators~IPASchema>} An array of nodes
 * representing each subschema contained by the `anyOf` applicator.
 */
function processAnyOf(subschemas, pointer) {
  return processDisjunctiveInPlaceApplicator(subschemas, pointer);
}

/**
 * Processes an `oneOf` in-place applicator.
 *
 * @param {Array.<object>} subschemas The subschemas included in the `oneOf`
 * in-place applicator.
 * @param {string} [pointer=''] A JSON Pointer that identifies the JSON Schema.
 *
 * @returns {Array.<module:inPlaceApplicators~IPASchema>} An array of nodes
 * representing each subschema contained by the `oneOf` applicator.
 */
function processOneOf(subschemas, pointer) {
  return processDisjunctiveInPlaceApplicator(subschemas, pointer);
}

/**
 * Processes a disjunctive in-place applicator.
 *
 * @param {Array.<object>} subschemas The subschemas included in the disjunctive
 * in-place applicator.
 * @param {string} [pointer=''] A JSON Pointer that identifies the JSON Schema.
 *
 * @returns {Array.<module:inPlaceApplicators~IPASchema>} An array of nodes
 * representing each subschema contained by the applicator.
 */
function processDisjunctiveInPlaceApplicator(subschemas, pointer) {
  return subschemas.map((s, i) => process(s, `${pointer}/${i}`));
}

/** Class representing a JSON Schema in-place applicator. */
class InPlaceApplicator {
  /**
   * Class constructor.
   *
   * @param {Array.<module:inPlaceApplicators~IPASchema>} subschemas The array
   * of nodes representing the subschemas contained by the applicator.
   * @param {number} selected The index indicating the subschema to be selected
   * at initialization.
   */
  constructor(subschemas, selected) {
    /**
     * The array of nodes representing the subschemas contained by the
     * applicator.
     *
     * @type {Array.<module:inPlaceApplicators~IPASchema>}
     */
    this.subschemas = subschemas;

    /**
     * The index indicating the selected subschema.
     *
     * @type {number}
     */
    this.selected = selected;
  }

  /**
   * Retrieves the node representing the in-place applicator subschema that is
   * currently selected.
   *
   * @returns {module:inPlaceApplicators~IPASchema} The selected node
   * representing an in-place applicator subschema.
   */
  getSelectedIpaSchema() {
    return this.subschemas[this.selected];
  }
}

/**
 * The node for a tree representation of the possible JSON Schema
 * materializations regarding its in-place applicators (standing for "In-Place
 * Application Schema").
 */
class IPASchema {
  /**
   * Class constructor.
   *
   * @param {object} common The keywords that are common to all possible
   * materializations of the in-place application subtree.
   * @param {Map.<string, module:inPlaceApplicators~InPlaceApplicator>} applicatorByPointer
   * A map including the child in-place applicators to be contained by the
   * node.
   */
  constructor(common, applicatorByPointer) {
    /**
     * The keywords that are common to all possible materializations of the
     * in-place application subtree.
     *
     * @type {object}
     */
    this.common = common;

    /**
     * A map including the child in-place applicators contained by the node.
     *
     * @type {Map.<string, module:inPlaceApplicators~InPlaceApplicator>}
     */
    this.applicatorByPointer = applicatorByPointer;
  }

  /**
   * Returns the nodes representing the selected in-place applicator subschemas.
   *
   * @returns {Array.<module:inPlaceApplicators~IPASchema>?} The array of
   * selected in-place applicator subnodes, or `null` if the node has no child
   * in-place applicators.
   */
  getSelectedApplicators() {
    if (this.applicatorByPointer.size)
      return Array.from(this.applicatorByPointer).map(([, a]) =>
        a.getSelectedIpaSchema()
      );
    else return null;
  }

  /**
   * Retrieves the materialization of the JSON Schema that is currently
   * selected.
   *
   * @returns {object} The selected materialization of the JSON Schema
   * represented by the node.
   */
  getSelectedSchema() {
    const recursion = (ipaSchema) => {
      if (ipaSchema.applicatorByPointer.size == 0) return ipaSchema;
      else
        return new IPASchema(
          aggregate(
            ipaSchema.common,
            ...Array.from(ipaSchema.applicatorByPointer).map(([, a]) =>
              recursion(a.getSelectedIpaSchema())
            )
          )
        );
    };

    return recursion(this).common;
  }

  /**
   * Retrieves the [annotation-related keywords](https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.9)
   * from the in-place application node.
   *
   * @returns {object} The JSON Schema subset representing the annotations at
   * the top level.
   */
  getAnnotations() {
    const annotations = {};

    if (this.common.title) annotations.title = this.common.title;

    if (this.common.description)
      annotations.description = this.common.description;

    return annotations;
  }
}

/**
 * Aggregates the keywords of a JSON Schema with the common keywords from a list
 * of in-place application nodes.
 *
 * Collisions are resolved applying the logic implemented by the
 * {@link module:inPlaceApplicators~Aggregation} class.
 *
 * @param {object} schema The JSON Schema to aggregate.
 * @param {...module:inPlaceApplicators~IPASchema} ipaSchemas The in-place
 * application nodes whose common keywords are to be aggregated.
 *
 * @returns {object} The aggregated JSON Schema.
 */
function aggregate(schema, ...ipaSchemas) {
  const common = {
    ...schema,
  };

  delete common.allOf;

  for (const ipaSchema of ipaSchemas) {
    const filteredKeywords = Object.entries(ipaSchema.common).filter(
      ([keyword]) =>
        !Object.values(JsonSchemaKeywords.Annotation).includes(keyword)
    );

    for (const [keyword, value] of filteredKeywords) {
      if (Object.prototype.hasOwnProperty.call(common, keyword))
        if (common[keyword] instanceof Aggregation) common[keyword].add(value);
        else common[keyword] = new Aggregation(keyword, common[keyword], value);
      else common[keyword] = value;
    }
  }

  for (const [keyword, value] of Object.entries(common))
    if (value instanceof Aggregation) common[keyword] = value.resolve();

  return common;
}

/** Class that handles keyword collision during aggregation process. */
class Aggregation {
  /**
   * Class constructor.
   *
   * @param {string} keyword The aggregated JSON Schema keyword.
   * @param {...any} init The initial values to aggregate.
   */
  constructor(keyword, ...init) {
    this.keyword = keyword;
    this.values = init.map((i) => (i instanceof Aggregation ? i.values : i));
  }

  /**
   * Adds a value to the aggregation, or joins the content of another
   * `Aggregation` object.
   *
   * @param {any} e The value/aggregation to be added/joined.
   */
  add(e) {
    if (e instanceof Aggregation) this.values.concat(e.values);
    else this.values.push(e);
  }

  /**
   * Generates an aggregated value following the specific rules associated to
   * the keyword.
   *
   * @returns {any} The value resulted of applying the aggregation rules to the
   * different contained values.
   *
   * @todo Implement specific logic for every keyword.
   */
  resolve() {
    const resolveSwitch = {
      [JsonSchemaKeywords.ObjectApplicator.PROPERTIES]: () =>
        Object.assign({}, ...this.values),
      [JsonSchemaKeywords.ObjectValidation.REQUIRED]: () => this.values.flat(),
      default: () =>
        console.warn(`Keyword aggregation not defined for the\
 "${this.keyword}" keyword.`),
    };

    return (resolveSwitch[this.keyword] || resolveSwitch.default)();
  }
}

export default process;
export { InPlaceApplicator, IPASchema };
