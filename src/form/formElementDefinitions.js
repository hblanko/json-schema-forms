/**
 * Module containing classes and objects that define the form element type and
 * behavior.
 *
 * @module formElementDefinitions
 */

/**
 * The available types of a form element.
 *
 * @enum {string}
 */
const ElementType = {
  /** The form element representing the root JSON Schema. */
  ROOT: 'root',

  /** A required form element. */
  REQUIRED: 'required',

  /** An optional form element. */
  OPTIONAL: 'optional',

  /** A form element able to be removed. */
  REMOVABLE: 'removable',
};

/**
 * The possible types of a form element title.
 *
 * @enum {string}
 */
const TitleType = {
  /** A regular, unmodifiable form element title. */
  STATIC: 'static',

  /** An editable form element title. */
  FIELD: 'field',

  /** A static element title for an added JSON Schema's `array` item. */
  ADDED_ITEM: 'addedItem',
};

/** The form element state descriptor. */
class State {
  /**
   * Class constructor.
   *
   * @param {boolean} [active=true] Flag indicating whether the form element is
   * active (i.e. the form element can be interacted --at least its toggler).
   * @param {boolean?} [disabled=null] Flag indicating whether the form element
   * is disabled (i.e. the input fields or child elements cannot be interacted).
   */
  constructor(active = true, disabled = null) {
    /**
     * Indicates whether the form element is active.
     *
     * @type {boolean}
     */
    this.active = active;

    /**
     * Indicates whether the form element is disabled.
     *
     * @type {boolean?}
     */
    this.disabled = disabled;
  }
}

export { ElementType, State, TitleType };
