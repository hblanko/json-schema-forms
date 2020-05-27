/**
 * Containers conceived to represent JSON Schema child applicators, as they are
 * described by the [JSON Schema RFC Draft](https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.9.3).
 *
 * @module childApplicators
 */
import { ElementType, State, TitleType } from '../formElementDefinitions.js';
import FormElement from '../formElement.js';
import { AddButton, GeneratorIcon, LabelTitle } from '../components.js';
import {
  arrangeAdditionalItems,
  arrangeAdditionalProperties,
  arrangeItems,
  arrangeProperties,
} from '../layouts.js';

/**
 * Interface for classes implementing containers that represent [JSON Schema
 * child applicators](https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.9.3).
 *
 * @interface ChildApplicator
 */

/**
 * The handler that includes the child applicator container.
 *
 * @member {module:childApplicators~ChildrenHandler} module:childApplicators~ChildApplicator#handler
 */

/**
 * A button that triggers the addition of new child JSON Schema form elements.
 *
 * @member {module:components~Component|undefined} module:childApplicators~ChildApplicator#addButton
 */

/**
 * The title of the child applicator container.
 *
 * @member {module:components~Component|undefined} module:childApplicators~ChildApplicator#title
 */

/**
 * The title icon of the child applicator container.
 *
 * @member {module:components~Component|undefined} module:childApplicators~ChildApplicator#titleIcon
 */

/**
 * A map to all contained child JSON Schema objects indexed by an number value.
 *
 * @member {Map.<number, module:formElement~FormElement>} module:childApplicators~ChildApplicator#childByIndex
 */

/**
 * Reference to the `<div>` element containing the form element representation
 * of all child JSON Schema objects.
 *
 * @member {HTMLDivElement} module:childApplicators~ChildApplicator#childrenDiv
 */

/**
 * Reference to the DOM object that contains the HTML structure of the JSON
 * Schema child applicator.
 *
 * @member {HTMLDivElement} module:childApplicators~ChildApplicator#domElement
 */

/**
 * Adds a new child JSON Schema form element to the container.
 *
 * @function
 *
 * @name module:childApplicators~ChildApplicator#addChild
 */

/**
 * Disables the child applicator container.
 *
 * @function
 *
 * @name module:childApplicators~ChildApplicator#disable
 */

/**
 * Enables the child applicator container.
 *
 * @function
 *
 * @name module:childApplicators~ChildApplicator#enable
 */

/**
 * Returns the part of the JSON instance that corresponds to the given JSON
 * Schema child applicator.
 *
 * @function
 *
 * @returns {object} The portion related to the given child applicator of the
 * complete JSON Schema instance.
 *
 * @name module:childApplicators~ChildApplicator#getChildInstance
 */

/**
 * Removes a child JSON Schema form element from the container.
 *
 * @function
 *
 * @param {number} index The key mapping to the child form element to be
 * removed.
 *
 * @name module:childApplicators~ChildApplicator#removeChild
 */

/**
 * The abstract handler for child applicator containers.
 *
 * @abstract
 */
class ChildrenHandler {
  /**
   * Class constructor.
   *
   * @param {module:formElement~FormElement} parent The parent form element
   * containing the child applicator containers to be handled.
   */
  constructor(parent) {
    /**
     * The parent form element containing the handled child applicator
     * containers.
     *
     * @type {module:formElement~FormElement}
     */
    this.parent = parent;

    /**
     * The handled child applicator containers.
     *
     * @type {object.<string, module:childApplicators~ChildApplicator>}
     */
    this.applicators = {};

    /**
     * The set of add buttons associated to the handled child applicator
     * containers.
     *
     * @type {Set}
     */
    this.addButtons = new Set();

    /**
     * The set of remove buttons associated to the child form elements.
     *
     * @type {Set}
     */
    this.removeButtons = new Set();

    /**
     * Reference to the DOM object that contains the HTML structure of the
     * component.
     *
     * @type {HTMLDivElement}
     */
    this.domElement = document.createElement('div');
  }

  /**
   * Returns the total count of child form elements from all the different
   * child applicator containers.
   *
   * @returns {number} The total count of child form elements.
   */
  getChildCount() {
    return Object.values(this.applicators).reduce(
      (acc, ca) => acc + ca.childByIndex.size,
      0
    );
  }

  /** Enables the add buttons from all the child applicator containers. */
  enableAddButtons() {
    for (const b of this.addButtons) b.enable();
  }

  /** Disables the add buttons from all the child applicator containers. */
  disableAddButtons() {
    for (const b of this.addButtons) b.disable();
  }

  /** Enables the remove buttons from all the child form elements. */
  enableRemoveButtons() {
    for (const b of this.removeButtons) b.enable();
  }

  /** Disables the remove buttons from all the child form elements. */
  disableRemoveButtons() {
    for (const b of this.removeButtons) b.disable();
  }

  /** Enables all the child applicator containers. */
  enable() {
    for (const a of Object.values(this.applicators)) a.enable();

    updateButtons(this);
  }

  /** Disables all the child applicator containers. */
  disable() {
    for (const a of Object.values(this.applicators)) a.disable();

    this.disableAddButtons();
    this.disableRemoveButtons();
  }
}

/**
 * Updates the state of add and remove buttons associated to child applicator
 * containers and form elements of a handler.
 *
 * @param {module:childApplicators~ChildrenHandler} handler The handler whose
 * buttons are to be updated.
 *
 * @modifies handler
 */
function updateButtons(handler) {
  updateAddButtons(handler);
  updateRemoveButtons(handler);
}

/**
 * Updates the state of the add buttons associated to the child applicator
 * containers of a handler.
 *
 * @param {module:childApplicators~ChildrenHandler} handler The handler whose
 * buttons are to be updated.
 *
 * @modifies handler
 */
function updateAddButtons(handler) {
  const maxChildren = Number.isInteger(handler.parent.keywords.maxItems)
    ? handler.parent.keywords.maxItems
    : handler.parent.keywords.maxProperties;

  if (Number.isInteger(maxChildren)) {
    if (handler.getChildCount() < maxChildren) handler.enableAddButtons();
    else if (handler.getChildCount() === maxChildren)
      handler.disableAddButtons();
    else {
      console.warn(`Maximum number of children (${maxChildren}) of the form
element ${handler.parent.pointer} has been overflown.`);
      handler.disableAddButtons();
    }
  }
}

/**
 * Updates the state of the add buttons associated to the child form elements of
 * a handler.
 *
 * @param {module:childApplicators~ChildrenHandler} handler The handler whose
 * buttons are to be updated.
 *
 * @modifies handler
 */
function updateRemoveButtons(handler) {
  const minChildren = Number.isInteger(handler.parent.keywords.minItems)
    ? handler.parent.keywords.minItems
    : handler.parent.keywords.minProperties;

  if (Number.isInteger(minChildren)) {
    if (handler.getChildCount() > minChildren) handler.enableRemoveButtons();
    else if (handler.getChildCount() === minChildren)
      handler.disableRemoveButtons();
    else {
      console.warn(`Minimum number of children (${minChildren}) of the form
element ${handler.parent.pointer} has been underflown.`);
      handler.disableRemoveButtons();
    }
  }
}

/**
 * Adds a child form element to a child applicator container, updating the
 * buttons state.
 *
 * @param {number} index The key identifying the child form element in the child
 * applicator container.
 * @param {module:formElement~FormElement} child The child form element to add
 * to the child applicator container.
 * @param {module:childApplicators~ChildApplicator} childApplicator The child
 * applicator container which the child form element will be added to.
 *
 * @modifies handler
 */
function addChildToApplicator(index, child, childApplicator) {
  childApplicator.childByIndex.set(index, child);
  childApplicator.childrenDiv.appendChild(child.layout.root);
  childApplicator.handler.removeButtons.add(child.titleIcon);
  updateButtons(childApplicator.handler);
}

/**
 * Removes a child form element from a child applicator container, updating the
 * buttons state.
 *
 * @param {number} index The key identifying the child form element in the child
 * applicator container.
 * @param {module:childApplicators~ChildApplicator} childApplicator The child
 * applicator container which the child form element will be removed from.
 *
 * @modifies handler
 */
function removeChildFromApplicator(index, childApplicator) {
  childApplicator.childByIndex.get(index).layout.root.remove();
  childApplicator.handler.removeButtons.delete(
    childApplicator.childByIndex.get(index).titleIcon
  );
  childApplicator.childByIndex.delete(index);
  updateButtons(childApplicator.handler);
}

/**
 * Handler for child applicator containers of `array`-typed form elements.
 *
 * @augments ChildrenHandler
 */
class ArrayHandler extends ChildrenHandler {
  /**
   * Class constructor.
   *
   * @param {module:formElement~FormElement} parent The parent form element
   * containing the child applicator containers to be handled.
   */
  constructor(parent) {
    super(parent);

    // Generates the "items" container <div> element.
    if (parent.keywords.items) {
      this.applicators.items = new Items(this);

      this.addButtons.add(this.applicators.items.addButton);

      for (const [, child] of this.applicators.items.childByIndex)
        this.removeButtons.add(child.titleIcon);

      this.domElement.appendChild(this.applicators.items.domElement);
    }

    // Generates the "additionalItems" container <div> element.
    if (parent.keywords.additionalItems) {
      this.applicators.additionalItems = new AdditionalItems(this);

      this.addButtons.add(this.applicators.additionalItems.addButton);

      for (const [, child] of this.applicators.additionalItems.childByIndex)
        this.removeButtons.add(child.titleIcon);

      this.domElement.appendChild(this.applicators.additionalItems.domElement);
    }

    updateButtons(this);
  }

  /**
   * Retrieves the JSON instance expressed by the child applicator containers
   * together with the inputted values.
   *
   * @returns {any} The JSON instance associated to the form element.
   */
  getInstance() {
    return Object.values(this.applicators).flatMap((a) => a.getChildInstance());
  }
}

/**
 * Handler for child applicator containers of `object`-typed form elements.
 *
 * @augments ChildrenHandler
 */
class ObjectHandler extends ChildrenHandler {
  /**
   * Class constructor.
   *
   * @param {module:formElement~FormElement} parent The parent form element
   * containing the child applicator containers to be handled.
   */
  constructor(parent) {
    super(parent);

    // Generates the "properties" container <div> element.
    if (parent.keywords.properties) {
      this.applicators.properties = new Properties(this);
      this.domElement.appendChild(this.applicators.properties.domElement);
    }

    // Generates the "additionalProperties" container <div> element.
    if (parent.keywords.additionalProperties) {
      this.applicators.additionalProperties = new AdditionalProperties(this);

      this.addButtons.add(this.applicators.additionalProperties.addButton);

      for (const [, child] of this.applicators.additionalProperties
        .childByIndex)
        this.removeButtons.add(child.titleIcon);

      this.domElement.appendChild(
        this.applicators.additionalProperties.domElement
      );
    }

    updateButtons(this);
  }

  /**
   * Retrieves the JSON instance expressed by the child applicator containers
   * together with the inputted values.
   *
   * @returns {any} The JSON instance associated to the form element.
   */
  getInstance() {
    return {
      ...Object.values(this.applicators).map((a) => a.getChildInstance()),
    };
  }
}

/**
 * A container representing the JSON Schema [`items` child applicator](https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.9.3.1.1).
 *
 * This container does not define the {@link module:childApplicators~ChildApplicator#title}
 * nor the {@link module:childApplicators~ChildApplicator#titleIcon} members.
 *
 * @implements {module:childApplicators~ChildApplicator}
 */
class Items {
  /**
   * @param {module:childApplicators~ArrayHandler} handler The handler which the
   * child applicator container will be added to.
   */
  constructor(handler) {
    this.handler = handler;

    this.childByIndex = new Map(
      Array.from(
        {
          length: handler.parent.keywords.minItems,
        },
        (_, index) =>
          createItem(handler.parent, index, () => void this.removeChild(index))
      )
    );

    this.addButton = new AddButton(
      () => void this.addChild(),
      {
        disabled: !handler.parent.isEnabled(),
      },
      {
        bootstrap: handler.parent.formOptions.bootstrap,
        fontAwesome: handler.parent.formOptions.fontAwesome,
      }
    );

    this.childrenDiv = document.createElement('div');

    for (const [, child] of this.childByIndex)
      this.childrenDiv.appendChild(child.layout.root);

    this.domElement = arrangeItems(this.childrenDiv, this.addButton.domElement);
  }

  addChild() {
    // Ensures incremental key.
    const index =
      this.childByIndex && this.childByIndex.size
        ? Array.from(this.childByIndex).pop().shift() + 1
        : 0;

    const child = createItem(
      this.handler.parent,
      index,
      () => void this.removeChild(index)
    );

    addChildToApplicator(...child, this);
  }

  disable() {
    for (const [, child] of this.childByIndex) child.deactivate();
  }

  enable() {
    for (const [, child] of this.childByIndex) child.activate();
  }

  getChildInstance() {
    return Array.from(this.childByIndex).map(([, child]) =>
      child.getInstance()
    );
  }

  removeChild(index) {
    removeChildFromApplicator(index, this);
  }
}

/**
 * Creates a JSON Schema form element to be added into the `items` child
 * applicator.
 *
 * @param {module:formElement~FormElement} parent The parent JSON Schema form
 * element.
 * @param {number} index The key identifying the child form element.
 * @param {Function} removeCallback The callback function to be called if the
 * newly created element is removed.
 *
 * @returns {module:formElement~FormElement} The child JSON Schema form element.
 */
const createItem = (parent, index, removeCallback) => [
  index,
  new FormElement(parent.keywords.items, {
    elementType: ElementType.REMOVABLE,
    titleType: TitleType.STATIC,
    state: yieldNewItemState(parent),
    pointer: `${parent.pointer}/items-${index}`,
    formOptions: parent.formOptions,
    removeCallback,
  }),
];

/**
 * Returns the state that should hold a newly created child of a given {@link
 * module:childApplicators.Items} container.
 *
 * @param {module:jsonSchema.JsonSchema} parent The parent JSON Schema form
 * element.
 *
 * @returns {module:formElementDefinitions~State} An object indicating the state
 * to be hold by a newly created child.
 */
const yieldNewItemState = (parent) => new State(parent.isEnabled(), null);

/**
 * A container representing the JSON Schema [`additionalItems` child applicator](https://json-schema.org/draft/2019-09/json-schema-core.html#additionalItems).
 *
 * @implements {module:childApplicators~ChildApplicator}
 */
class AdditionalItems {
  /**
   * @param {module:childApplicators~ArrayHandler} handler The handler which the
   * child applicator container will be added to.
   */
  constructor(handler) {
    this.handler = handler;

    this.childByIndex = new Map(
      Array.from(
        {
          length: additionalItemsMinimumChildren(handler.parent),
        },
        (_, index) =>
          createAdditionalItem(
            handler.parent,
            index,
            () => void this.removeChild(index)
          )
      )
    );

    this.addButton = new AddButton(
      () => void this.addChild(),
      {
        disabled: !handler.parent.isEnabled(),
      },
      {
        bootstrap: handler.parent.formOptions.bootstrap,
        fontAwesome: handler.parent.formOptions.fontAwesome,
      }
    );

    this.titleIcon = new GeneratorIcon({
      fontAwesome: handler.parent.formOptions.fontAwesome,
    });

    this.title = new LabelTitle(
      handler.parent.keywords.additionalItems.title,
      handler.parent.keywords.additionalItems.description,
      undefined,
      {
        bootstrap: handler.parent.formOptions.bootstrap,
        fontAwesome: handler.parent.formOptions.fontAwesome,
      }
    );

    this.childrenDiv = document.createElement('div');

    for (const [, child] of this.childByIndex)
      this.childrenDiv.appendChild(child.layout.root);

    this.domElement = arrangeAdditionalItems(
      this.titleIcon.domElement,
      this.title.domElement,
      this.childrenDiv,
      this.addButton.domElement
    );
  }

  addChild() {
    // Ensures incremental key.
    const index =
      this.childByIndex && this.childByIndex.size
        ? Array.from(this.childByIndex).pop().shift() + 1
        : 0;

    const child = createAdditionalItem(
      this.handler.parent,
      index,
      () => void this.removeChild(index)
    );

    addChildToApplicator(...child, this);
  }

  disable() {
    for (const [, child] of this.childByIndex) child.deactivate();
  }

  enable() {
    for (const [, child] of this.childByIndex) child.activate();
  }

  getChildInstance() {
    return Array.from(this.childByIndex).map(([, child]) =>
      child.getInstance()
    );
  }

  removeChild(index) {
    removeChildFromApplicator(index, this);
  }
}

/**
 * Creates a JSON Schema form element to be added into the `additionalItems`
 * child applicator.
 *
 * @param {module:formElement~FormElement} parent The parent JSON Schema form
 * element.
 * @param {number} index The key identifying the child form element.
 * @param {Function} removeCallback The callback function to be called if the
 * newly created element is removed.
 *
 * @returns {module:formElement~FormElement} The child JSON Schema form element.
 */
const createAdditionalItem = (parent, index, removeCallback) => [
  index,
  new FormElement(parent.keywords.additionalItems, {
    elementType: ElementType.REMOVABLE,
    titleType: TitleType.ADDED_ITEM,
    state: yieldNewAdditionalItemState(parent),
    pointer: `${parent.pointer}/additionalItems-${index}`,
    formOptions: parent.formOptions,
    removeCallback,
  }),
];

/**
 * Returns the state that should hold a newly created child of a given {@link
 * module:childApplicators.AdditionalItems} container.
 *
 * @param {module:formElement~FormElement} parent The parent JSON Schema form
 * element.
 *
 * @returns {module:formElementDefinitions~State} An object indicating the state
 * to be hold by a newly created child.
 */
const yieldNewAdditionalItemState = (parent) =>
  new State(parent.isEnabled(), null);

/**
 * Returns the minimum number of children that the {@link
 * module:childApplicators.AdditionalItems} container of a given JSON Schema
 * form element must have at initialization.
 *
 * @param {module:formElement~FormElement} parent The parent JSON Schema form
 * element.
 *
 * @returns {number} The minimum number of children that the container must have
 * at initialization.
 */
const additionalItemsMinimumChildren = (parent) => {
  if (parent.keywords.minItems)
    if (parent.keywords.items)
      if (Array.isArray(parent.keywords.items))
        // Handles the case of "items" keyword as an array of JSON Schemas.
        return parent.keywords.minItems - parent.keywords.items.length;
      else return 0;
    else return parent.keywords.minItems;
  else return 0;
};

/**
 * A container representing the JSON Schema [`properties` child applicator](https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.9.3.2.1).
 *
 * This container does not define the {@link
 * module:childApplicators~ChildApplicator#addButton}, nor the {@link
 * module:childApplicators~ChildApplicator#title}, nor the {@link
 * module:childApplicators~ChildApplicator#titleIcon} members.
 *
 * @implements {module:childApplicators~ChildApplicator}
 */
class Properties {
  /**
   * @param {module:childApplicators~ArrayHandler} handler The handler which the
   * child applicator container will be added to.
   */
  constructor(handler) {
    this.handler = handler;
    this.childByIndex = new Map(
      Object.entries(
        handler.parent.keywords.properties
      ).map(([propertyKey, schema], index) =>
        createProperty(schema, propertyKey, handler.parent, index)
      )
    );

    this.childrenDiv = document.createElement('div');

    for (const [, child] of this.childByIndex)
      this.childrenDiv.appendChild(child.layout.root);

    this.domElement = arrangeProperties(this.childrenDiv);
  }

  addChild() {}

  disable() {
    for (const [, child] of this.childByIndex) child.deactivate();
  }

  enable() {
    for (const [, child] of this.childByIndex) child.activate();
  }

  getChildInstance() {
    return Object.fromEntries(
      Array.from(this.childByIndex)
        .filter(([, child]) => child.isEnabled())
        .map(([, child]) => [child.propertyKey, child.getInstance()])
    );
  }

  removeChild() {}
}

/**
 * Creates a JSON Schema form element to be added into the `properties` child
 * applicator.
 *
 * @param {object} schema The JSON Schema of the property to be expressed by the
 * child form element.
 * @param {string} propertyKey The key of the property to be expressed by the
 * child form element.
 * @param {module:formElement~FormElement} parent The parent JSON Schema form
 * element.
 * @param {number} index The key identifying the child form element.
 *
 * @returns {module:formElement~FormElement} The child JSON Schema form element.
 */
const createProperty = (schema, propertyKey, parent, index) => {
  const required =
    parent.keywords.required && parent.keywords.required.includes(propertyKey);

  const elementType = required ? ElementType.REQUIRED : ElementType.OPTIONAL;

  return [
    index,
    new FormElement(schema, {
      elementType,
      titleType: TitleType.STATIC,
      state: yieldNewPropertyState(parent, elementType),
      pointer: `${parent.pointer}/properties-${propertyKey}`,
      propertyKey,
      formOptions: parent.formOptions,
    }),
  ];
};

/**
 * Returns the state that should hold a newly created child of a given {@link
 * module:childApplicators.Properties} container.
 *
 * @param {module:formElement~FormElement} parent The parent JSON Schema form
 * element.
 * @param {string} childElementType The {@link
 * module:formElementDefinitions.ElementType} of the newly created child.
 *
 * @returns {module:formElementDefinitions~State} An object indicating the state
 * to be hold by a newly created child.
 */
const yieldNewPropertyState = (parent, childElementType) => {
  const d =
    childElementType === ElementType.OPTIONAL
      ? parent.formOptions.initTogglersOff
      : null;

  return new State(parent.isEnabled(), d);
};

/**
 * A container representing the JSON Schema [`additionalProperties` child
 * applicator](https://json-schema.org/draft/2019-09/json-schema-core.html#additionalProperties).
 *
 * @implements {module:childApplicators~ChildApplicator}
 */
class AdditionalProperties {
  /**
   * @param {module:childApplicators~ArrayHandler} handler The handler which the
   * child applicator container will be added to.
   */
  constructor(handler) {
    this.handler = handler;

    this.childByIndex = new Map(
      Array.from(
        {
          length: additionalPropertiesMinimumChildren(handler.parent),
        },
        (_, index) =>
          createAdditionalProperty(
            handler.parent,
            index,
            () => void this.removeChild(index)
          )
      )
    );

    this.addButton = new AddButton(
      () => void this.addChild(),
      {
        disabled: !handler.parent.isEnabled(),
      },
      {
        bootstrap: handler.parent.formOptions.bootstrap,
        fontAwesome: handler.parent.formOptions.fontAwesome,
      }
    );

    this.titleIcon = new GeneratorIcon({
      fontAwesome: handler.parent.formOptions.fontAwesome,
    });

    this.title = new LabelTitle(
      handler.parent.keywords.additionalProperties.title,
      handler.parent.keywords.additionalProperties.description,
      undefined,
      {
        bootstrap: handler.parent.formOptions.bootstrap,
        fontAwesome: handler.parent.formOptions.fontAwesome,
      }
    );

    this.childrenDiv = document.createElement('div');

    for (const [, child] of this.childByIndex)
      this.childrenDiv.appendChild(child.layout.root);

    this.domElement = arrangeAdditionalProperties(
      this.titleIcon.domElement,
      this.title.domElement,
      this.childrenDiv,
      this.addButton.domElement
    );
  }

  addChild() {
    // Ensures incremental key.
    const index =
      this.childByIndex && this.childByIndex.size
        ? Array.from(this.childByIndex).pop().shift() + 1
        : 0;
    const child = createAdditionalProperty(
      this.handler.parent,
      index,
      () => void this.removeChild(index)
    );

    addChildToApplicator(...child, this);
  }

  disable() {
    for (const [, child] of this.childByIndex) child.deactivate();
  }

  enable() {
    for (const [, child] of this.childByIndex) child.activate();
  }

  getChildInstance() {
    return Object.fromEntries(
      Array.from(this.childByIndex).map(([, child]) => [
        child.title.getValue(),
        child.getInstance(),
      ])
    );
  }

  removeChild(index) {
    removeChildFromApplicator(index, this);
  }
}

/**
 * Creates a JSON Schema form element to be added into the
 * `additionalProperties` child applicator.
 *
 * @param {module:formElement~FormElement} parent The parent JSON Schema form
 * element.
 * @param {number} index The key identifying the child form element.
 * @param {Function} removeCallback The callback function to be called if the
 * newly created element is removed.
 *
 * @returns {module:formElement~FormElement} The child JSON Schema form element.
 */
const createAdditionalProperty = (parent, index, removeCallback) => [
  index,
  new FormElement(parent.keywords.additionalProperties, {
    elementType: ElementType.REMOVABLE,
    titleType: TitleType.FIELD,
    state: yieldNewAdditionalPropertyState(parent),
    pointer: `${parent.pointer}/additionalProperties-${index}`,
    formOptions: parent.formOptions,
    removeCallback,
  }),
];

/**
 * Returns the state that should hold a newly created child of a given {@link
 * module:childApplicators.AdditionalProperties} container.
 *
 * @param {module:formElement~FormElement} parent The parent JSON Schema form
 * element.
 *
 * @returns {module:formElementDefinitions~State} An object indicating the state
 * to be hold by a newly created child.
 */
const yieldNewAdditionalPropertyState = (parent) =>
  new State(parent.isEnabled(), null);

/**
 * Returns the minimum number of children that the {@link
 * module:childApplicators.AdditionalProperties} container of a given JSON
 * Schema form element must have at initialization.
 *
 * @param {module:formElement~FormElement} parent The parent JSON Schema form
 * element.
 *
 * @returns {number} The minimum number of children that the container must have
 * at initialization.
 */
const additionalPropertiesMinimumChildren = (parent) => {
  if (parent.keywords.minProperties)
    if (parent.keywords.properties)
      return (
        parent.keywords.minProperties -
        Object.keys(parent.keywords.properties).length
      );
    else return parent.keywords.minProperties;
  else return 0;
};

export { ArrayHandler, ObjectHandler };
