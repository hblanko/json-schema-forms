/**
 * A global map holding weak references from the DOM elements to its represented
 * {@link module:formElement~FormElement} objects.
 *
 * @type {WeakMap.<HTMLDivElement, module:formElement~FormElement>}
 */
const formElementByDiv = new WeakMap();

export default formElementByDiv;
