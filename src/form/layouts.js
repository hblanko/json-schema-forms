/**
 * Module for the creation and handling of the DOM representation for
 * {@link module:formElement~FormElement} objects.
 *
 * It relies on [Bootstrap](https://getbootstrap.com/) for styling and
 * positioning.
 *
 * @module layouts
 */
import JsonSchemaType from './json-schema/JsonSchemaType.js';
import pointerToId from '../utils/pointerToId.js';

/** Class that structures the DOM layout of the form element. */
class Layout {
  /**
   * Class constructor.
   *
   * @param {module:formElement~FormElement} fe The form element which the DOM
   * structure and styling will be created for.
   */
  constructor(fe) {
    /**
     * A header bar inlcuding form element annotations and metadata.
     *
     * @type {HTMLDivElement}
     */
    this.headerBar = createHeaderBar(fe);

    /**
     * The pane containing the content of the form element.
     *
     * @type {HTMLDivElement}
     */
    this.contentPane = createContentPane(fe);

    /**
     * The main pane that includes the header bar and the content pane.
     *
     * @type {HTMLDivElement}
     */
    this.mainPane = [this.headerBar, this.contentPane].reduce((acc, e) => {
      acc.appendChild(e);
      return acc;
    }, document.createElement('div'));

    /**
     * The root DOM element.
     *
     * @type {HTMLDivElement}
     */
    this.root = document.createElement('div');
    this.root.id = pointerToId(fe.pointer);
    this.root.appendChild(this.mainPane);

    this.root.classList.add('row', 'pt-4');
    this.mainPane.classList.add('col');
  }

  /**
   * Updates the content pane with the new content included in the form element
   * object.
   *
   * @param {module:formElement~FormElement} fe The form element to be updated.
   */
  updateContentPane(fe) {
    const newContentPane = createContentPane(fe);
    this.contentPane.replaceWith(newContentPane);
    this.contentPane = newContentPane;
  }
}

/**
 * Creates the header bar to represent a form element.
 *
 * @param {module:formElement~FormElement} fe The form element which the header
 * bar will be created for.
 *
 * @returns {HTMLDivElement} The header bar.
 */
function createHeaderBar(fe) {
  const icon = fe.titleIcon.domElement;
  const title = fe.title ? fe.title.domElement : null;
  const selectors = fe.selectors ? fe.selectors.domElement : null;

  const bar = [icon, title, selectors].reduce((acc, e) => {
    if (e) acc.appendChild(e);

    return acc;
  }, document.createElement('div'));

  const headerBar = document.createElement('div');
  headerBar.appendChild(bar);

  headerBar.classList.add('row');
  bar.classList.add('col', 'd-flex', 'align-items-center');
  icon.classList.add('icon');

  if (selectors) selectors.classList.add('pl-2', 'ml-auto');

  return headerBar;
}

/**
 * Creates the content pane to represent a form element according to its
 * associated JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * pane will be created for.
 *
 * @returns {HTMLDivElement} The content pane.
 */
function createContentPane(fe) {
  if (fe.keywords.const || (fe.keywords.enum && fe.keywords.enum.length === 1))
    return createConstLayout(fe);
  else if (fe.keywords.enum && fe.keywords.enum.length > 1)
    return createEnumLayout(fe);
  else if (fe.keywords.type === JsonSchemaType.ARRAY)
    return createArrayLayout(fe);
  else if (fe.keywords.type === JsonSchemaType.OBJECT)
    return createObjectLayout(fe);
  else return createPrimitiveTypeLayout(fe);
}

/**
 * Creates the content pane to represent a form element with a `const` JSON
 * Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * pane will be created for.
 *
 * @returns {HTMLDivElement} The content pane conceived for a form element with
 * a `const` JSON Schema.
 */
function createConstLayout(fe) {
  return createPrimitiveTypeLayout(fe);
}

/**
 * Creates the content pane to represent a form element with an `enum` JSON
 * Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * pane will be created for.
 *
 * @returns {HTMLDivElement} The content pane conceived for a form element with
 * an `enum` JSON Schema.
 */
function createEnumLayout(fe) {
  const contentPane = fe.content.domElement;
  contentPane.classList.add('primitive', 'row', 'pt-2');

  return contentPane;
}

/**
 * Creates the content pane to represent a form element with an `array`-typed
 * JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * pane will be created for.
 *
 * @returns {HTMLDivElement} The content pane conceived for a form element with
 * an `array`-typed JSON Schema.
 */
function createArrayLayout(fe) {
  const contentPane = fe.content.domElement;
  contentPane.classList.add('row', 'row-cols-1');

  return contentPane;
}

/**
 * Creates the content pane to represent a form element with an `object`-typed
 * JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * pane will be created for.
 *
 * @returns {HTMLDivElement} The content pane conceived for a form element with
 * an `object`-typed JSON Schema.
 */
function createObjectLayout(fe) {
  const contentPane = fe.content.domElement;
  contentPane.classList.add('row', 'row-cols-1');

  return contentPane;
}

/**
 * Creates the content pane to represent a form element with any primitive JSON
 * Schema type (`boolean`, `integer`, `number` and `string`).
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * pane will be created for.
 *
 * @returns {HTMLDivElement} The content pane conceived for a form element with
 * an primitive-typed JSON Schema.
 */
function createPrimitiveTypeLayout(fe) {
  const contentPane = fe.content.domElement;
  contentPane.classList.add('primitive', 'pt-2');

  return contentPane;
}

/**
 * Creates an arranged HTML container (by including styling and structure) for
 * the part of a form element representing a `properties` JSON Schema child
 * applicator.
 *
 * @param {HTMLDivElement} childrenDiv The `<div>` element containing the
 * children form elements representation.
 *
 * @returns {HTMLDivElement} The arranged HTML container.
 */
function arrangeProperties(childrenDiv) {
  childrenDiv.classList.add('col-sm-11', 'offset-sm-1', 'pl-sm-3', 'pl-4');
  return childrenDiv;
}

/**
 * Creates an arranged HTML container (by including styling and structure) for
 * the part of a form element representing an `additionalProperties` JSON Schema
 * child applicator.
 *
 * @param {HTMLDivElement} titleIconDiv The `<div>` element containing the child
 * applicator's title icon representation.
 * @param {HTMLDivElement} titleDiv The `<div>` element containing the child
 * applicator's title representation.
 * @param {HTMLDivElement} childrenDiv The `<div>` element containing the
 * children form elements representation.
 * @param {HTMLDivElement} addButtonDiv The `<div>` element containing the child
 * applicator's add button representation.
 *
 * @returns {HTMLDivElement} The arranged HTML container.
 */
function arrangeAdditionalProperties(
  titleIconDiv,
  titleDiv,
  childrenDiv,
  addButtonDiv
) {
  return arrangeAdditionalChildren(
    titleIconDiv,
    titleDiv,
    childrenDiv,
    addButtonDiv
  );
}

/**
 * Creates an arranged HTML container (by including styling and structure) for
 * the part of a form element representing an `items` JSON Schema child
 * applicator.
 *
 * @param {HTMLDivElement} childrenDiv The `<div>` element containing the
 * children form elements representation.
 * @param {HTMLDivElement} addButtonDiv The `<div>` element containing the child
 * applicator's add button representation.
 *
 * @returns {HTMLDivElement} The arranged HTML container.
 */
function arrangeItems(childrenDiv, addButtonDiv) {
  const domElement = [childrenDiv, addButtonDiv].reduce((acc, e) => {
    acc.appendChild(e);
    return acc;
  }, document.createElement('div'));

  childrenDiv.classList.add('col-sm-11', 'offset-sm-1', 'pl-sm-3', 'pl-4');
  addButtonDiv.classList.add(
    'col-sm-11',
    'offset-sm-1',
    'pl-sm-3',
    'pl-4',
    'pt-3'
  );
  return domElement;
}

/**
 * Creates an arranged HTML container (by including styling and structure) for
 * the part of a form element representing an `additionalItems` JSON Schema
 * child applicator.
 *
 * @param {HTMLDivElement} titleIconDiv The `<div>` element containing the child
 * applicator's title icon representation.
 * @param {HTMLDivElement} titleDiv The `<div>` element containing the child
 * applicator's title representation.
 * @param {HTMLDivElement} childrenDiv The `<div>` element containing the
 * children form elements representation.
 * @param {HTMLDivElement} addButtonDiv The `<div>` element containing the
 * child applicator's add button representation.
 *
 * @returns {HTMLDivElement} The arranged HTML container.
 */
function arrangeAdditionalItems(
  titleIconDiv,
  titleDiv,
  childrenDiv,
  addButtonDiv
) {
  return arrangeAdditionalChildren(
    titleIconDiv,
    titleDiv,
    childrenDiv,
    addButtonDiv
  );
}

/**
 * Creates an arranged HTML container (by including styling and structure) for
 * the part of a form element representing a JSON Schema child applicator that
 * allows for additional elements.
 *
 * @param {HTMLDivElement} titleIconDiv The `<div>` element containing the child
 * applicator's title icon representation.
 * @param {HTMLDivElement} titleDiv The `<div>` element containing the child
 * applicator's title representation.
 * @param {HTMLDivElement} childrenDiv The `<div>` element containing the
 * children form elements representation.
 * @param {HTMLDivElement} addButtonDiv The `<div>` element containing the child
 * applicator's add button representation.
 *
 * @returns {HTMLDivElement} The arranged HTML container.
 */
function arrangeAdditionalChildren(
  titleIconDiv,
  titleDiv,
  childrenDiv,
  addButtonDiv
) {
  const bar = [titleIconDiv, titleDiv].reduce((acc, e) => {
    acc.appendChild(e);

    return acc;
  }, document.createElement('div'));

  const colBar = document.createElement('div');
  colBar.appendChild(bar);
  const headerBar = document.createElement('div');
  headerBar.appendChild(colBar);

  const mainPane = [childrenDiv, addButtonDiv].reduce((acc, e) => {
    if (e) acc.appendChild(e);

    return acc;
  }, document.createElement('div'));

  const domElement = [headerBar, mainPane].reduce((acc, e) => {
    acc.appendChild(e);

    return acc;
  }, document.createElement('div'));

  domElement.classList.add('col');

  headerBar.classList.add('row', 'pt-3');
  colBar.classList.add('col', 'pl-sm-5');
  bar.classList.add('d-flex', 'align-items-center');
  titleIconDiv.classList.add('icon');

  mainPane.classList.add('row', 'row-cols-1');
  childrenDiv.classList.add('col-sm-11', 'offset-sm-1', 'pl-sm-3', 'pl-4');
  addButtonDiv.classList.add(
    'col-sm-11',
    'offset-sm-1',
    'pl-sm-3',
    'pl-4',
    'pt-3'
  );

  return domElement;
}

export default Layout;
export {
  arrangeProperties,
  arrangeAdditionalProperties,
  arrangeItems,
  arrangeAdditionalItems,
};
