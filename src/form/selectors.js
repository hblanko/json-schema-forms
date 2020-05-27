/**
 * Dropdown buttons organized in toolbars, acting as selectors for the
 * alternative materializations of a JSON Schema (thus following the tree
 * representation of schemas, {@link module:inPlaceApplicators~IPASchema}).
 *
 * ❗️ This module relies on [Bootstrap](https://getbootstrap.com/); if not
 * available, the HTML result will not be properly displayed.
 *
 * @module selectors
 *
 * @see module:inPlaceApplicators~IPASchema
 */
import pointerToId from '../utils/pointerToId.js';

/**
 * Class representing a container for {@link module:selectors~SelectorsToolbar}
 * components.
 *
 * @implements {module:components~Component}
 */
class SelectorsContainer {
  /**
   * Class constructor.
   *
   * @param {Map.<string, module:selectors~SelectorsToolbar>} toolbarByPointer
   * A map containing the selectors toolbars, indexed by the JSON Pointer string
   * that points to the in-place applicator represented by the first selector of
   * the mapped toolbar.
   */
  constructor(toolbarByPointer) {
    this.domElement = document.createElement('div');
    this.domElement.classList.add('btn-toolbar');
    this.domElement.setAttribute('role', 'toolbar');

    /**
     * The map containing the selectors toolbars indexed by the JSON Pointer
     * string that points to the in-place applicator represented by the first
     * selector of the mapped toolbar.
     *
     * @type {Map.<string, module:selectors~SelectorsToolbar>}
     */
    this.toolbarByPointer = toolbarByPointer;

    for (const [, toolbar] of this.toolbarByPointer)
      this.domElement.appendChild(toolbar.domElement);
  }

  disable() {
    for (const [, toolbar] of this.toolbarByPointer) toolbar.disable();
  }

  enable() {
    for (const [, toolbar] of this.toolbarByPointer) toolbar.enable();
  }

  /**
   * Updates selectors toolbars present in the container and the underlying
   * {@link module:inPlaceApplicators~IPASchema} tree.
   *
   * @param {string} formElementId The `id` of the form element.
   * @param {string} pointer The JSON Pointer to the in-place applicator
   * represented by the first selector of the toolbar which triggered the
   * update.
   * @param {number} selectorIndex The index in the toolbar of the selector
   * triggering the update.
   * @param {number} dropdownItemIndex The index in the dropdown option list
   * which triggered the update.
   * @param {Function} callback The callback function to be called on `click`
   * events from the newly appended selectors.
   */
  update(formElementId, pointer, selectorIndex, dropdownItemIndex, callback) {
    // Updates selection of in-place applicator.
    this.toolbarByPointer
      .get(pointer)
      .selectors[selectorIndex].updateSelection(dropdownItemIndex);

    // Generates the new selectors to attach.
    const ipaSchema = this.toolbarByPointer
      .get(pointer)
      .selectors[selectorIndex].applicator.getSelectedIpaSchema();

    const [selectorsToAppend, newSelectorsMatrix] = generateUpdatedSelectors(
      formElementId,
      ipaSchema,
      pointer,
      selectorIndex,
      callback
    );

    // Updates the changed toolbar.
    this.toolbarByPointer
      .get(pointer)
      .update(selectorIndex, dropdownItemIndex, selectorsToAppend);

    // Removes the obsolete toolbars.
    for (const [p] of this.toolbarByPointer) {
      if (p.startsWith(pointer) && p !== pointer) {
        this.toolbarByPointer.get(p).remove();
        this.toolbarByPointer.delete(p);
      }
    }

    // Adds the new toolbars.
    for (const [p, selectors] of newSelectorsMatrix) {
      this.toolbarByPointer.set(p, new SelectorsToolbar(selectors));
      this.domElement.appendChild(this.toolbarByPointer.get(p).domElement);
    }
  }
}

/**
 * Class representing a toolbar of {@link module:selectors~Selector} components.
 *
 * @implements {module:components~Component}
 */
class SelectorsToolbar {
  /**
   * Class constructor.
   *
   * @param {Array.<module:selectors~Selector>} selectors An array of selector
   * components contained in the toolbar.
   */
  constructor(selectors) {
    this.domElement = document.createElement('div');
    this.domElement.classList.add('btn-group', 'mr-2');
    this.domElement.setAttribute('role', 'group');
    this.domElement.setAttribute('aria-label', 'Selectors toolbar');

    /**
     * The array of selector components contained in the toolbar.
     *
     * @type {Array.<module:selectors~Selector>}
     */
    this.selectors = selectors;

    for (const selector of this.selectors)
      this.domElement.appendChild(selector.domElement);
  }

  disable() {
    for (const selector of this.selectors) selector.disable();
  }

  enable() {
    for (const selector of this.selectors) selector.enable();
  }

  /**
   * Updates the toolbar by removing the obsolete selectors and appending the
   * ones provided.
   *
   * @param {number} selectorIndex The index in the toolbar of the selector
   * triggering the update.
   * @param {number} dropdownItemIndex The index in the dropdown option list
   * which triggered the update.
   * @param {Array.<module:selectors~Selector>} selectorsToAppend The array of
   * selectors that should be appended to the toolbar.
   */
  update(selectorIndex, dropdownItemIndex, selectorsToAppend) {
    // Updates selector content.
    this.selectors[selectorIndex].update(dropdownItemIndex);

    // Removes the obsolete selectors and appends the new ones.
    const deleteCount = this.selectors.length - 1 - selectorIndex;

    Array.from(
      {
        length: deleteCount,
      },
      (_, index) => this.selectors[selectorIndex + 1 + index].remove()
    );

    this.selectors.splice(selectorIndex + 1, deleteCount, ...selectorsToAppend);

    for (const selector of selectorsToAppend)
      this.domElement.appendChild(selector.domElement);
  }

  /** Removes the DOM elements associated to the toolbar. */
  remove() {
    this.domElement.remove();
  }
}

/**
 * Class representing a selector component, which represents an
 * {@link module:inPlaceApplicators~InPlaceApplicator} in the
 * {@link module:inPlaceApplicators~IPASchema} tree.
 *
 * The selector consists of a dropdown button with a list of choices each
 * representing a subschema in the associated in-place applicator.
 *
 * @implements {module:components~Component}
 */
class Selector {
  /**
   * Class constructor.
   *
   * @param {module:inPlaceApplicators~InPlaceApplicator} applicator The
   * in-place applicator to be represented.
   * @param {string} formElementId The `id` of the form element.
   * @param {string} pointer The JSON Pointer to the in-place applicator
   * represented by the first selector of the toolbar containing the newly
   * created selector.
   * @param {number} selectorIndex The index in the toolbar of the newly created
   * selector.
   * @param {Function} callback The callback function for the `click` DOM event
   * generated by any of the choices listed in the dropdown.
   * @param {boolean} [disabled=false] Flag indicating whether the button should
   * be disabled at initialization.
   */
  constructor(
    applicator,
    formElementId,
    pointer,
    selectorIndex,
    callback,
    disabled = false
  ) {
    /**
     * The represented in-place applicator.
     *
     * @type {module:inPlaceApplicators~InPlaceApplicator}
     */
    this.applicator = applicator;
    this.domElement = document.createElement('div');
    this.domElement.classList.add('btn-group');
    this.domElement.setAttribute('role', 'group');

    /**
     * The array of selector components contained in the toolbar.
     *
     * @type {Array.<module:selectors~Selector>}
     */
    this.button = this.domElement.appendChild(document.createElement('button'));
    this.button.id = `${formElementId}__selectors__${pointerToId(
      pointer + '/' + selectorIndex
    )}`;
    this.button.type = 'button';
    this.button.classList.add(
      'btn',
      'btn-primary',
      'btn-sm',
      'dropdown-toggle'
    );
    this.button.dataset.toggle = 'dropdown';
    this.button.setAttribute('aria-haspopup', true);
    this.button.setAttribute('aria-expanded', false);

    this.button.disabled = !!disabled;

    const dropdownDiv = this.domElement.appendChild(
      document.createElement('div')
    );
    dropdownDiv.classList.add('dropdown-menu');
    dropdownDiv.setAttribute('aria-labelledby', this.button.id);

    for (const [
      dropdownItemIndex,
      ipaSchema,
    ] of this.applicator.subschemas.entries()) {
      const a = dropdownDiv.appendChild(document.createElement('a'));
      a.classList.add('dropdown-item');
      a.href = '#';
      a.innerText = ipaSchema.getAnnotations().title;
      a.addEventListener(
        'click',
        () =>
          void callback(
            formElementId,
            pointer,
            selectorIndex,
            dropdownItemIndex
          )
      );

      if (window.$)
        window
          .$(a)
          .click((e) =>
            e.preventDefault ? e.preventDefault() : (e.returnValue = false)
          );
    }

    this.update();
  }

  disable() {
    this.button.disabled = true;
  }

  enable() {
    this.button.disabled = false;
  }

  /** Removes the DOM elements associated to the selector. */
  remove() {
    this.domElement.remove();
  }

  /**
   * Updates the underlying {@link module:inPlaceApplicators~InPlaceApplicator}
   * and the selector display.
   *
   * @param {number} selected Index of the selected in-place applicator
   * subschema.
   */
  updateSelection(selected) {
    this.applicator.selected = selected;
    this.update();
  }

  /** Updates the selector display. */
  update() {
    this.button.innerText = this.applicator
      .getSelectedIpaSchema()
      .getAnnotations().title;
  }
}

/**
 * Creates a {@link module:selectors~SelectorsContainer} which handles the
 * selectors representing the given {@link module:inPlaceApplicators~IPASchema}
 * tree.
 *
 * @param {string} formElementId The `id` of the form element.
 * @param {module:inPlaceApplicators~IPASchema} ipaSchema The root element of
 * the {@link module:inPlaceApplicators~IPASchema} tree that the selectors
 * should represent.
 * @param {Function} callback The callback function to be called on `click`
 * events from the created selectors.
 * @param {boolean} [disabled=false] Flag indicating whether the button should
 * be disabled at initialization.
 *
 * @returns {module:selectors~SelectorsContainer} The created
 * {@link module:selectors~SelectorsContainer}.
 */
function createSelectors(formElementId, ipaSchema, callback, disabled = false) {
  const selectorsMatrix = generateSelectors(
    formElementId,
    ipaSchema,
    callback,
    disabled
  );

  return new SelectorsContainer(
    new Map(
      selectorsMatrix.map(([pointer, selectors]) => [
        pointer,
        new SelectorsToolbar(selectors),
      ])
    )
  );
}

/**
 * Generates a matrix containing the selectors representing the given
 * {@link module:inPlaceApplicators~IPASchema} tree.
 *
 * @param {string} formElementId The `id` of the form element.
 * @param {module:inPlaceApplicators~IPASchema} ipaSchema The root element of
 * the {@link module:inPlaceApplicators~IPASchema} tree that the selectors
 * should represent.
 * @param {Function} callback The callback function to be called on `click`
 * events from the created selectors.
 * @param {boolean} disabled Flag indicating whether the selectors should be
 * disabled at initialization.
 *
 * @returns {Array.<Array>} A matrix whose rows are 2-length arrays, each of
 * them representing a selectors toolbar:
 *
 * - The first element is a JSON Pointer string that points to the in-place
 * applicator represented by the first selector of the mapped toolbar.
 *
 * - The second element is an array of {@link module:selectors~Selector} to be
 * assembled as a {@link module:selectors~SelectorsToolbar}.
 */
function generateSelectors(formElementId, ipaSchema, callback, disabled) {
  return forkRecursiveSelectorGenerator(
    formElementId,
    ipaSchema,
    callback,
    disabled
  );
}

/**
 * Generates the update data which includes the new selectors to be added to a
 * {@link module:selector~SelectorContainer}, with respect to the given
 * {@link module:inPlaceApplicators~IPASchema} tree.
 *
 * @param {string} formElementId The `id` of the form element.
 * @param {module:inPlaceApplicators~IPASchema} ipaSchema The root element of
 * the {@link module:inPlaceApplicators~IPASchema} tree that the selectors
 * should represent.
 * @param {string} updatedToolbarPointer The JSON Pointer to the in-place
 * applicator represented by the first selector of the toolbar which triggered
 * the update.
 * @param {number} triggererSelectorIndex The index in the toolbar of the
 * selector which triggered the update.
 * @param {Function} callback The callback function to be called on `click`
 * events from the created selectors.
 * @param {boolean} [disabled=false] Flag indicating whether the button should
 * be disabled at initialization.
 *
 * @returns {Array.<Array>} A 2-length array with the following structure:
 *
 * - The first element is an array of {@link module:selectors~Selector}
 * components to append to the toolbar which triggered the update.
 *
 * - The second element is a matrix whose rows are 2-length arrays, each of them
 * representing a selectors toolbar to be appended as result of the update:
 *
 *   - The first element is a JSON Pointer string that points to the in-place
 * applicator represented by the first selector of the mapped toolbar.
 *
 *   - The second element is an array of {@link module:selectors~Selector} to be
 * assembled as a {@link module:selectors~SelectorsToolbar}.
 */
function generateUpdatedSelectors(
  formElementId,
  ipaSchema,
  updatedToolbarPointer,
  triggererSelectorIndex,
  callback,
  disabled = false
) {
  if (ipaSchema.applicatorByPointer.size === 1) {
    const nextApplicator = ipaSchema.applicatorByPointer.values().next().value;

    const result = recursiveSelectorGenerator(
      formElementId,
      nextApplicator,
      updatedToolbarPointer,
      callback,
      disabled,
      triggererSelectorIndex + 1
    );

    const selectorsToAppend = result.shift();
    return [selectorsToAppend[1], result];
  } else
    return [
      [],
      forkRecursiveSelectorGenerator(
        formElementId,
        ipaSchema,
        callback,
        disabled
      ),
    ];
}

/**
 * Forks the execution of {@link module:selectors~recursiveSelectorGenerator} to
 * produce multiple selectors toolbars.
 *
 * @param {string} formElementId The `id` of the form element.
 * @param {module:inPlaceApplicators~IPASchema} ipaSchema The node of the
 * {@link module:inPlaceApplicators~IPASchema} tree to be represented.
 * @param {Function} callback The callback function to be called on `click`
 * events from the created selectors.
 * @param {boolean} disabled Flag indicating whether the selectors should be
 * disabled at initialization.
 *
 * @returns {Array.<Array>} A matrix whose rows are 2-length arrays, each of
 * them representing a selectors toolbar to be appended as result of the update:
 *
 * - The first element is a JSON Pointer string that points to the in-place
 * applicator represented by the first selector of the mapped toolbar.
 *
 * - The second element is an array of {@link module:selectors~Selector} to be
 * assembled as a {@link module:selectors~SelectorsToolbar}.
 */
function forkRecursiveSelectorGenerator(
  formElementId,
  ipaSchema,
  callback,
  disabled
) {
  return Array.from(ipaSchema.applicatorByPointer).flatMap(([p, a]) =>
    recursiveSelectorGenerator(formElementId, a, p, callback, disabled)
  );
}

/**
 * Recursive execution of the selector generation.
 *
 * @param {string} formElementId The `id` of the form element.
 * @param {module:inPlaceApplicators~InPlaceApplicator} applicator  The in-place
 * applicator to be represented by the selector being currently built.
 * @param {string} matrixKeyPointer A JSON Pointer string that points to the
 * in-place applicator represented by the first selector of the toolbar being
 * built.
 * @param {Function} callback The callback function to be called on `click`
 * events from the created selectors.
 * @param {boolean} disabled Flag indicating whether the selectors should be
 * disabled at initialization.
 * @param {number} [currentSelectorIndex=0] The index in the toolbar of the
 * selector being currently built.
 *
 * @returns {Array.<Array>} A matrix whose rows are 2-length arrays, each of
 * them representing a selectors toolbar to be appended as result of the update:
 *
 * - The first element is a JSON Pointer string that points to the in-place
 * applicator represented by the first selector of the mapped toolbar.
 *
 * - The second element is an array of {@link module:selectors~Selector} to be
 * assembled as a {@link module:selectors~SelectorsToolbar}.
 */
function recursiveSelectorGenerator(
  formElementId,
  applicator,
  matrixKeyPointer,
  callback,
  disabled,
  currentSelectorIndex = 0
) {
  const selector = new Selector(
    applicator,
    formElementId,
    matrixKeyPointer,
    currentSelectorIndex,
    callback,
    disabled
  );

  const selectedIpaSchema = applicator.getSelectedIpaSchema();

  if (selectedIpaSchema.applicatorByPointer.size == 0)
    return [[matrixKeyPointer, [selector]]];
  else if (selectedIpaSchema.applicatorByPointer.size == 1) {
    const nextApplicator = selectedIpaSchema.applicatorByPointer.values().next()
      .value;
    const result = recursiveSelectorGenerator(
      formElementId,
      nextApplicator,
      matrixKeyPointer,
      callback,
      disabled,
      currentSelectorIndex + 1
    );

    result[0][1] = [selector, ...result[0][1]];
    return result;
  } else {
    // (selectedIpaSchema.applicatorByPointer.size > 1)
    const results = forkRecursiveSelectorGenerator(
      formElementId,
      selectedIpaSchema,
      callback,
      disabled
    );

    return [[matrixKeyPointer, [selector]], ...results];
  }
}

export default createSelectors;
