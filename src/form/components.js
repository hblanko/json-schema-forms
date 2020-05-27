/**
 * Definitions of classes and functions that build the components required to
 * generate JSON Schema forms.
 *
 * @module components
 */

/**
 * Interface for classes that represent a form component.
 *
 * @interface Component
 */

/**
 * Reference to the DOM object that contains the HTML structure of the
 * component.
 *
 * @member {HTMLDivElement} module:components~Component#domElement
 */

/**
 * Enables the component.
 *
 * @function
 *
 * @name module:components~Component#enable
 */

/**
 * Disables the component.
 *
 * @function
 *
 * @name module:components~Component#disable
 */

/**
 * Interface for classes that represent a form component that contain an input
 * control.
 *
 * @interface InputComponent
 *
 * @augments module:components~Component
 */

/**
 * Returns the value assigned to the component.
 *
 * @returns {any} The value taken by the component.
 *
 * @function
 *
 * @name module:components~InputComponent#getValue
 */

/**
 * Returns the `id` of the input control element.
 *
 * @returns {any} The value taken by the component.
 *
 * @function
 *
 * @name module:components~InputComponent#getId
 */

/**
 * An icon for a generator form element.
 *
 * @implements {module:components~Component}
 */
class GeneratorIcon {
  /**
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.fontAwesome] If given, it indicates the
   * [Font Awesome](https://fontawesome.com/) version which the component should
   * be built for.
   */
  constructor(options = {}) {
    this.domElement = document.createElement('div');

    if (options.fontAwesome)
      this.domElement
        .appendChild(document.createElement('i'))
        .classList.add('fas', 'fa-bullseye');
    else
      this.domElement.appendChild(document.createElement('h5')).innerText = '↳';
  }

  enable() {}

  disable() {}
}

/**
 * An icon for a required form element.
 *
 * @implements {module:components~Component}
 */
class RequiredIcon {
  /**
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.fontAwesome] If given, it indicates the
   * [Font Awesome](https://fontawesome.com/) version which the component should
   * be built for.
   */
  constructor(options = {}) {
    this.domElement = document.createElement('div');

    if (options.fontAwesome)
      this.domElement
        .appendChild(document.createElement('i'))
        .classList.add('fas', 'fa-asterisk');
    else
      this.domElement.appendChild(document.createElement('h5')).innerText = '*';
  }

  enable() {}

  disable() {}
}

/**
 * An icon for the root form element.
 *
 * @implements {module:components~Component}
 */
class RootIcon {
  /**
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.fontAwesome] If given, it indicates the
   * [Font Awesome](https://fontawesome.com/) version which the component should
   * be built for.
   */
  constructor(options = {}) {
    this.domElement = document.createElement('div');

    if (options.fontAwesome)
      this.domElement
        .appendChild(document.createElement('i'))
        .classList.add('fab', 'fa-sourcetree');
    else
      this.domElement.appendChild(document.createElement('h5')).innerText = '⚲';
  }

  enable() {}

  disable() {}
}

/**
 * A button that represents the action of adding a child form element to its
 * associated [JSON Schema child applicator](https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.9.3).
 *
 * @implements {module:components~Component}
 */
class AddButton {
  /**
   * @param {Function} callback The callback function for the `click` DOM event
   * generated by the button.
   * @param {object} [buttonAttributes={}] The parameters to consider as
   * attributes for the [HTML `<button>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button).
   * @param {boolean} [buttonAttributes.disabled=false] Flag indicating whether
   * the button should be disabled at initialization.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   * @param {string} [options.fontAwesome] If given, it indicates the
   * [Font Awesome](https://fontawesome.com/) version which the component should
   * be built for.
   */
  constructor(callback, { disabled = false } = {}, options = {}) {
    this.domElement = document.createElement('div');

    /**
     * Reference to the DOM object representing the `<button>` element.
     *
     * @type {HTMLButtonElement}
     */
    this.button = this.domElement.appendChild(document.createElement('button'));
    this.button.type = 'button';
    this.button.disabled = !!disabled;

    if (options.bootstrap)
      this.button.classList.add('btn', 'btn-sm', 'btn-success');

    if (options.fontAwesome)
      this.button
        .appendChild(document.createElement('i'))
        .classList.add('fas', 'fa-plus');
    else this.button.innerText = '+';

    this.button.addEventListener('click', () => void callback());
  }

  enable() {
    this.button.disabled = false;
  }

  disable() {
    this.button.disabled = true;
  }
}

/**
 * A button that represents the action of removing its associated form element
 * from the parent [JSON Schema child applicator](https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.9.3).
 *
 * @implements {module:components~Component}
 */
class RemoveButton {
  /**
   * @param {Function} callback The callback function for the `click` DOM event
   * generated by the button.
   * @param {object} [buttonAttributes={}] The parameters to consider as
   * attributes for the [HTML `<button>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button).
   * @param {boolean} [buttonAttributes.disabled=false] Flag indicating whether
   * the button should be disabled at initialization.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component
   * should be built for.
   * @param {string} [options.fontAwesome] If given, it indicates the
   * [Font Awesome](https://fontawesome.com/) version which the component should
   * be built for.
   */
  constructor(callback, { disabled = false } = {}, options = {}) {
    this.domElement = document.createElement('div');

    /**
     * Reference to the DOM object representing the `<button>` element.
     *
     * @type {HTMLButtonElement}
     */
    this.button = this.domElement.appendChild(document.createElement('button'));
    this.button.type = 'button';
    this.button.disabled = !!disabled;

    if (options.bootstrap)
      this.button.classList.add('btn', 'btn-sm', 'btn-danger');

    if (options.fontAwesome)
      this.button
        .appendChild(document.createElement('i'))
        .classList.add('fas', 'fa-minus');
    else this.button.innerText = '-';

    this.button.addEventListener('click', () => void callback());
  }

  enable() {
    this.button.disabled = false;
  }

  disable() {
    this.button.disabled = true;
  }
}

/**
 * A toggler switch that allows to enable and disable a form element.
 *
 * @implements {module:components~Component}
 */
class Toggler {
  /**
   * @param {string} formElementId The `id` of the form element.
   * @param {Function} callback The callback function for the `click` DOM event
   * generated by the toggler.
   * @param {object} [togglerParameters={}] The parameters to initialize the
   * toggler.
   * @param {boolean} [togglerParameters.disabled=false] Flag indicating whether
   * the toggler should be disabled at initialization.
   * @param {boolean} [togglerParameters.initOff=false] Flag indicating whether
   * the toggler should be initialized in "off" state.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   */
  constructor(
    formElementId,
    callback,
    { disabled = false, initOff = false } = {},
    options = {}
  ) {
    this.domElement = document.createElement('div');

    /**
     * Reference to the DOM object representing the `<input>` element handled
     * by the toggler.
     *
     * @type {HTMLInputElement}
     */
    this.input = document.createElement('input');
    this.input.id = `${formElementId}__toggler__input`;
    this.input.type = 'checkbox';
    this.input.defaultChecked = !initOff;
    this.input.checked = !initOff;
    this.input.disabled = !!disabled;

    if (options.bootstrap) {
      const customSwitchDiv = this.domElement.appendChild(
        document.createElement('div')
      );

      customSwitchDiv.appendChild(this.input);

      const label = customSwitchDiv.appendChild(
        document.createElement('label')
      );
      label.htmlFor = this.input.id;

      customSwitchDiv.classList.add('custom-control', 'custom-switch');
      this.input.classList.add('custom-control-input');
      label.classList.add('custom-control-label');
    } else this.domElement.appendChild(this.input);

    this.input.addEventListener('click', () => void callback());
  }

  enable() {
    this.input.disabled = false;
  }

  disable() {
    this.input.disabled = true;
  }
}

/**
 * An input field conceived for the representation of the JSON Schema `boolean`
 * type.
 *
 * @implements {module:components~InputComponent}
 */
class BooleanInput {
  /**
   * @param {string} formElementId The `id` of the form element.
   * @param {object} [inputAttributes={}] The parameters to consider as
   * attributes for the [HTML `<input>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).
   * @param {boolean} [inputAttributes.disabled=false] Flag indicating whether
   * the input field should be disabled at initialization.
   * @param {string} [inputAttributes.form] The `id` of the `<form>` element
   * with which the input control is associated.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   */
  constructor(formElementId, { disabled = false, form } = {}, options = {}) {
    this.domElement = document.createElement('div');

    /**
     * Reference to the DOM object representing the `<input>` element.
     *
     * @type {HTMLInputElement}
     */
    this.input = document.createElement('input');
    this.input.id = `${formElementId}__input`;
    this.input.type = 'checkbox';
    this.input.disabled = !!disabled;

    if (form) this.input.setAttribute('form', form);

    if (options.bootstrap) {
      const customCheckboxDiv = this.domElement.appendChild(
        document.createElement('div')
      );

      customCheckboxDiv.appendChild(this.input);

      const customCheckboxLabel = customCheckboxDiv.appendChild(
        document.createElement('label')
      );

      customCheckboxLabel.htmlFor = this.input.id;

      customCheckboxDiv.classList.add('custom-control', 'custom-checkbox');
      this.input.classList.add('custom-control-input');
      customCheckboxLabel.classList.add('custom-control-label');
    } else this.domElement.appendChild(this.input);
  }

  enable() {
    this.input.disabled = false;
  }

  disable() {
    this.input.disabled = true;
  }

  getValue() {
    return this.input.checked;
  }

  getId() {
    return this.input.id;
  }
}

/**
 * An input field conceived for the representation of the JSON Schema `number`
 * or `integer` types.
 *
 * @implements {module:components~InputComponent}
 */
class NumericInput {
  /**
   * @param {string} formElementId The `id` of the form element.
   * @param {object} [inputAttributes={}] The parameters to consider as
   * attributes for the [HTML `<input>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).
   * @param {boolean} [inputAttributes.disabled=false] Flag indicating whether
   * the input field should be disabled at initialization.
   * @param {string} [inputAttributes.form] The `id` of the `<form>` element
   * with which the input control is associated.
   * @param {number} [inputAttributes.max] The maximum value allowed by the
   * input field.
   * @param {number} [inputAttributes.min] The minimum value allowed by the
   * input field.
   * @param {string} [inputAttributes.placeholder] Text appearing when the
   * input field is empty.
   * @param {number} [inputAttributes.step] The incremental step allowed by the
   * input field.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   */
  constructor(
    formElementId,
    { disabled = false, form, max, min, placeholder, step } = {},
    options = {}
  ) {
    this.domElement = document.createElement('div');

    /**
     * Reference to the DOM object representing the `<input>` element.
     *
     * @type {HTMLInputElement}
     */
    this.input = this.domElement.appendChild(document.createElement('input'));
    this.input.id = `${formElementId}__input`;
    this.input.type = 'number';
    this.input.required = true;

    if (Number.isFinite(max)) this.input.max = max;

    if (Number.isFinite(min)) this.input.min = min;

    if (placeholder) this.input.placeholder = placeholder;

    if (Number.isFinite(step)) this.input.step = step;

    this.input.disabled = !!disabled;

    if (form) this.input.setAttribute('form', form);

    if (options.bootstrap) this.input.classList.add('form-control');
  }

  enable() {
    this.input.disabled = false;
  }

  disable() {
    this.input.disabled = true;
  }

  getValue() {
    return Number.parseInt(this.input.value);
  }

  getId() {
    return this.input.id;
  }
}

/**
 * An input field conceived for the representation of the JSON Schema `string`
 * type.
 *
 * @implements {module:components~InputComponent}
 */
class TextInput {
  /**
   * @param {string} formElementId The `id` of the form element.
   * @param {object} [inputAttributes={}] The parameters to consider as
   * attributes for the [HTML `<input>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).
   * @param {boolean} [inputAttributes.disabled=false] Flag indicating whether
   * the input field should be disabled at initialization.
   * @param {string} [inputAttributes.form] The `id` of the `<form>` element
   * with which the input control is associated.
   * @param {number} [inputAttributes.maxlength] The maximum `string` length
   * allowed as input value.
   * @param {number} [inputAttributes.minlength] The minimum `string` length
   * allowed as input value.
   * @param {RegExp} [inputAttributes.pattern] A regular expression which the
   * input value should match.
   * @param {string} [inputAttributes.placeholder] Text appearing when the
   * input field is empty.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   */
  constructor(
    formElementId,
    { disabled = false, form, maxlength, minlength, pattern, placeholder } = {},
    options = {}
  ) {
    this.domElement = document.createElement('div');

    /**
     * Reference to the DOM object representing the `<input>` element.
     *
     * @type {HTMLInputElement}
     */
    this.input = this.domElement.appendChild(document.createElement('input'));
    this.input.id = `${formElementId}__input`;
    this.input.type = 'text';
    this.input.required = true;

    if (!isNaN(maxlength)) this.input.maxlength = maxlength;

    if (!isNaN(minlength)) this.input.minlength = minlength;

    if (pattern) this.input.pattern = pattern;

    if (placeholder) this.input.placeholder = placeholder;

    this.input.disabled = !!disabled;

    if (form) this.input.setAttribute('form', form);

    if (options.bootstrap) this.input.classList.add('form-control');
  }

  enable() {
    this.input.disabled = false;
  }

  disable() {
    this.input.disabled = true;
  }

  getValue() {
    return this.input.value;
  }

  getId() {
    return this.input.id;
  }
}

/**
 * An input field to be used as title for form elements without predefined
 * title.
 *
 * @implements {module:components~InputComponent}
 */
class InputTitle {
  /**
   * @param {string} formElementId The `id` of the form element.
   * @param {object} [inputAttributes={}] The parameters to consider as
   * attributes for the [HTML `<input>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).
   * @param {boolean} [inputAttributes.disabled=false] Flag indicating whether
   * the input field should be disabled at initialization.
   * @param {string} [inputAttributes.placeholder] Text appearing when the
   * input field is empty.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   */
  constructor(
    formElementId,
    { disabled = false, placeholder } = {},
    options = {}
  ) {
    this.domElement = document.createElement('div');

    /**
     * Reference to the DOM object representing the `<input>` element.
     *
     * @type {HTMLInputElement}
     */
    this.input = this.domElement.appendChild(document.createElement('input'));
    this.input.id = `${formElementId}__title__input`;
    this.input.type = 'text';
    this.input.disabled = !!disabled;

    if (placeholder) this.input.placeholder = placeholder;

    if (options.bootstrap) this.input.classList.add('form-control');
  }

  enable() {
    this.input.disabled = false;
  }

  disable() {
    this.input.disabled = true;
  }

  getValue() {
    return this.input.value;
  }

  getId() {
    return this.input.id;
  }
}

/**
 * A label to be used as form element title.
 *
 * @implements {module:components~Component}
 */
class LabelTitle {
  /**
   * @param {string} text The string to use as label.
   * @param {string} description A string describing the form element.
   * @param {object} [labelAttributes={}] The parameters to consider as
   * attributes for the [HTML `<label>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label).
   * @param {string} [labelAttributes.htmlFor] The `id` of the referred
   * component.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   * @param {string} [options.fontAwesome] If given, it indicates the
   * [Font Awesome](https://fontawesome.com/) version which the component should
   * be built for.
   */
  constructor(text, description, { htmlFor } = {}, options = {}) {
    this.domElement = document.createElement('div');

    /**
     * Reference to the DOM object representing the `<label>` element.
     *
     * @type {HTMLLabelElement}
     */
    this.label = this.domElement.appendChild(document.createElement('label'));
    const h5 = this.label.appendChild(document.createElement('h5'));
    h5.innerText = text;

    if (htmlFor) this.label.htmlFor = htmlFor;

    if (description) {
      const helpIcon = h5.appendChild(document.createElement('span'));
      helpIcon.classList.add('help-icon');
      helpIcon.title = description;

      if (options.fontAwesome)
        helpIcon
          .appendChild(document.createElement('i'))
          .classList.add('far', 'fa-question-circle');
      else helpIcon.innerText = '?';

      if (options.bootstrap) {
        helpIcon.dataset.toggle = 'tooltip';
        helpIcon.dataset.placement = 'right';

        if (window.bootstrap) window.$(helpIcon).tooltip();

        helpIcon.classList.add('ml-2');
      }
    }

    if (options.bootstrap) {
      this.label.classList.add('mb-0');
      h5.classList.add('mb-0');
    }
  }

  enable() {}

  disable() {}

  /**
   * Sets the `for` attribute of the `<label>` element.
   *
   * @param {string} htmlFor The `id` of the HTML element that the label should
   * refer to.
   */
  setLabelFor(htmlFor) {
    this.label.htmlFor = htmlFor;
  }
}

/**
 * An input control to make a choice among multiple options.
 *
 * @implements {module:components~InputComponent}
 */
class Select {
  /**
   * @param {string} formElementId The `id` of the form element.
   * @param {Array} choices The array of possible choices to show.
   * @param {Function} callback The callback function for the `change` DOM event
   * generated by the `<select>` element.
   * @param {number} initialSelected The index of the option to appear as
   * selected at initialization.
   * @param {object} [selectAttributes={}] The parameters to consider as
   * attributes for the [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select).
   * @param {boolean} selectAttributes.disabled Flag indicating whether the
   * input field should be disabled at initialization.
   * @param {boolean} [selectAttributes.multiple] Flag indicating whether the
   * `<select>` must show multiple choice rows. The `selectAttributes.size`
   * overrides its behavior if present.
   * @param {number} [selectAttributes.size] The value that the `<select>`
   * element would take as `size` attribute. The parameter will be ignored in
   * case its value is bigger than the array length of the `options` parameter.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   */
  constructor(
    formElementId,
    choices,
    callback,
    initialSelected,
    { disabled, multiple, size } = {},
    options = {}
  ) {
    this.domElement = document.createElement('div');

    /**
     * Reference to the DOM object representing the `<select>` element.
     *
     * @type {HTMLSelectElement}
     */
    this.select = this.domElement.appendChild(document.createElement('select'));
    this.select.id = `${formElementId}__select`;

    if (!isNaN(size))
      this.select.size = choices.length > size ? size : choices.length;
    else if (!isNaN(multiple)) this.select.multiple = true;

    this.select.required = true;
    this.select.disabled = !!disabled;

    if (options.bootstrap) this.select.classList.add('custom-select');

    for (const [i, c] of choices.entries()) {
      const option = this.select.appendChild(document.createElement('option'));
      option.value = i;

      option.appendChild(c);

      if (i === initialSelected) option.selected = true;
    }

    if (callback)
      this.select.addEventListener(
        'change',
        () => void callback(this.select.value)
      );
  }

  enable() {
    this.select.disabled = false;
  }

  disable() {
    this.select.disabled = true;
  }

  getValue() {
    return this.select.value;
  }

  getId() {
    return this.select.id;
  }
}

/**
 * A panel that contains a {@link module:components~Select} component and a
 * {@link module:components~InstanceView} that shows the selected instance.
 *
 * @implements {module:components~InputComponent}
 */
class SelectInstancePanel {
  /**
   * @param {string} formElementId The `id` of the form element.
   * @param {Array} instances The array of JSON instances.
   * @param {string} objectSubstitute A string to be shown as choice in the case
   * of an option corresponding to a JSON Schema `object` type.
   * @param {string} arraySubstitute A string to be shown as choice in the case
   * of an option corresponding to a JSON Schema `array` type.
   * @param {Function} booleanTranslateFunction A function that maps boolean
   * values into strings.
   * @param {number} [initialSelected=0] The index of the option to appear as
   * selected at initialization.
   * @param {object} [selectAttributes={}] The parameters to consider as
   * attributes for the [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select).
   * @param {boolean} [selectAttributes.disabled=false] Flag indicating whether
   * the input field should be disabled at initialization.
   * @param {boolean} [selectAttributes.multiple] Flag indicating whether the
   * `<select>` must show multiple choice rows. The `selectAttributes.size`
   * overrides its behavior if present.
   * @param {number} [selectAttributes.size] The value that the `<select>`
   * element would take as `size` attribute. The parameter will be ignored in
   * case its value is bigger than the array length of the `options` parameter.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   * @param {string} [options.fontAwesome] If given, it indicates the
   * [Font Awesome](https://fontawesome.com/) version which the component should
   * be built for.
   */
  constructor(
    formElementId,
    instances,
    objectSubstitute,
    arraySubstitute,
    booleanTranslateFunction,
    initialSelected,
    { disabled = false, multiple, size } = {},
    options = {}
  ) {
    const instanceViewDiv = document.createElement('div');

    /**
     * The array of selectable JSON instances.
     *
     * @type {Array}
     */
    this.instances = instances;

    const _createInstanceView = (i) => {
      if (!isJsonPrimitiveType(this.instances[i]))
        instanceViewDiv.appendChild(
          createInstanceView(this.instances[i], booleanTranslateFunction, {
            bootstrap: options.bootstrap,
          })
        );
    };

    _createInstanceView(initialSelected);

    /**
     * The {@link module:components~Select} component.
     *
     * @type {module:components~Select}
     */
    this.select = new Select(
      formElementId,
      instances.map((instance) =>
        instanceAsTitle(
          instance,
          arraySubstitute,
          objectSubstitute,
          booleanTranslateFunction
        )
      ),
      (i) => {
        if (instanceViewDiv.hasChildNodes())
          instanceViewDiv.lastElementChild.remove();

        _createInstanceView(i);
      },
      initialSelected,
      {
        disabled,
        size,
        multiple,
      },
      {
        bootstrap: options.bootstrap,
      }
    );

    this.domElement = document.createElement('div');
    this.domElement.appendChild(this.select.domElement);
    this.domElement.appendChild(instanceViewDiv);

    if (options.bootstrap) {
      this.domElement.classList.add('row');
      this.select.domElement.classList.add('col-4');
      instanceViewDiv.classList.add('col-8');
    }
  }

  enable() {
    this.select.enable();
  }

  disable() {
    this.select.disable();
  }

  getValue() {
    return this.instances[Number.parseInt(this.select.getValue())];
  }

  getId() {
    return this.select.getId();
  }
}

/**
 * A panel that contains [Bootstrap pills](https://getbootstrap.com/docs/4.5/components/navs/#pills)
 * together with an instance view that allows to choose and display the selected
 * instance.
 *
 * ❗️ This class relies on Bootstrap; if not available, the HTML result will not
 * be properly displayed.
 *
 * @implements {module:components~InputComponent}
 */
class PillsInstancePanel {
  /**
   * @param {string} formElementId The `id` of the form element.
   * @param {Array} instances The array of JSON instances.
   * @param {string} objectSubstitute A string to be shown as choice in the case
   * of an option corresponding to a JSON Schema `object` type.
   * @param {string} arraySubstitute A string to be shown as choice in the case
   * of an option corresponding to a JSON Schema `array` type.
   * @param {Function} booleanTranslateFunction A function that maps boolean
   * values into strings.
   * @param {boolean} [disabled=false] Flag indicating whether the input field
   * should be disabled at initialization.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   * @param {string} [options.fontAwesome] If given, it indicates the
   * [Font Awesome](https://fontawesome.com/) version which the component should
   * be built for.
   */
  constructor(
    formElementId,
    instances,
    objectSubstitute,
    arraySubstitute,
    booleanTranslateFunction,
    disabled = false,
    options = {}
  ) {
    this.domElement = document.createElement('div');

    /**
     * The array of selectable JSON instances.
     *
     * @type {Array}
     */
    this.instances = instances;
    const ul = this.domElement.appendChild(document.createElement('ul'));
    ul.classList.add('col-5', 'nav', 'nav-pills', 'pl-3');
    ul.setAttribute('role', 'tablist');
    const panesDiv = this.domElement.appendChild(document.createElement('div'));
    panesDiv.classList.add('col-7', 'tab-content');

    /**
     * The array of anchors shown as pills.
     *
     * @type {Array.<HTMLAnchorElement>}
     */
    this.choices = [];

    for (const [i, instance] of instances.entries()) {
      const li = ul.appendChild(document.createElement('li'));
      li.classList.add('nav-item');
      const a = li.appendChild(document.createElement('a'));
      a.id = `${formElementId}__pills__${i}`;
      const paneId = `${formElementId}__panes__${i}`.replace(/\//gi, '_');
      a.href = `#${paneId}`;
      a.classList.add('nav-link');
      a.dataset.toggle = 'tab';
      a.setAttribute('role', 'tab');
      a.setAttribute('aria-controls', paneId);

      if (disabled) a.classList.add('disabled');

      a.appendChild(
        instanceAsTitle(
          instance,
          arraySubstitute,
          objectSubstitute,
          booleanTranslateFunction
        )
      );

      this.choices.push(a);

      const paneDiv = panesDiv.appendChild(document.createElement('div'));
      paneDiv.id = paneId;
      paneDiv.classList.add('tab-pane', 'fade');
      paneDiv.setAttribute('role', 'tabpanel');
      paneDiv.setAttribute('aria-labelledby', a.id);

      if (isJsonPrimitiveType(instance))
        paneDiv.appendChild(document.createTextNode(''));
      else
        paneDiv.appendChild(
          createInstanceView(instance, booleanTranslateFunction),
          {
            bootstrap: options.bootstrap,
          }
        );

      if (i === 0) {
        a.classList.add('active');
        a.setAttribute('aria-selected', 'true');
        paneDiv.classList.add('show', 'active');
      } else a.setAttribute('aria-selected', 'false');
    }
  }

  enable() {
    for (const a of this.choices) a.classList.remove('disabled');
  }

  disable() {
    for (const a of this.choices) a.classList.add('disabled');
  }

  getValue() {
    return this.instances[
      this.choices.findIndex((a) => a.classList.contains('active'))
    ];
  }

  getId() {
    return undefined;
  }
}

/**
 * A panel that displays a given JSON instance.
 *
 * Although, strictly speaking, this component has no interactive control, it
 * implements the {@link module:components~InputComponent} interface as it has
 * to provide a mean to retrieve the displayed instance.
 *
 * @implements {module:components~InputComponent}
 */
class InstanceViewPanel {
  /**
   * @param {any} instance The JSON instance to be displayed.
   * @param {Function} booleanTranslateFunction A function that maps boolean
   * values into strings.
   * @param {object} [options={}] Parameters considered to generate the
   * component.
   * @param {string} [options.bootstrap] If given, it indicates the
   * [Bootstrap](https://getbootstrap.com/) version which the component should
   * be built for.
   */
  constructor(instance, booleanTranslateFunction, options = {}) {
    this.domElement = document.createElement('div');

    /**
     * The instance to display.
     *
     * @type {any}
     */
    this.instance = instance;

    this.domElement.appendChild(
      createInstanceView(instance, booleanTranslateFunction, options)
    );
  }

  enable() {}

  disable() {}

  getValue() {
    return this.instance;
  }

  getId() {
    return undefined;
  }
}

/**
 * Creates an HTML element containing a representation of a given JSON instance.
 *
 * @param {any} instance The JSON instance to be displayed.
 * @param {Function} booleanTranslateFunction A function that maps boolean
 * values into strings.
 * @param {object} [options={}] Parameters considered to generate the component.
 * @param {string} [options.bootstrap] If given, it indicates the
 * [Bootstrap](https://getbootstrap.com/) version which the component should be
 * built for.
 *
 * @returns {HTMLElement} An element containing the HTML structure of the
 * instance representation.
 */
function createInstanceView(instance, booleanTranslateFunction, options = {}) {
  const recursion = (instance) => {
    if (Array.isArray(instance)) {
      const table = document.createElement('table');

      if (options.bootstrap) table.classList.add('table', 'table-striped');

      const tbody = table.appendChild(document.createElement('tbody'));

      for (const i of instance)
        tbody
          .appendChild(document.createElement('tr'))
          .appendChild(document.createElement('td'))
          .appendChild(recursion(i));

      return table;
    } else if (instance instanceof Object) {
      const table = document.createElement('table');

      if (options.bootstrap) table.classList.add('table', 'table-striped');

      const tbody = table.appendChild(document.createElement('tbody'));

      for (const [key, value] of Object.entries(instance)) {
        const tr = tbody.appendChild(document.createElement('tr'));
        const th = tr.appendChild(document.createElement('th'));
        th.scope = 'row';
        th.innerText = key;
        tr.appendChild(document.createElement('td')).appendChild(
          recursion(value)
        );
      }

      return table;
    } else if (typeof instance === 'boolean')
      return buildBooleanInstance(instance, booleanTranslateFunction);
    else if (instance === null) return buildNullInstance();
    else if (typeof instance === 'number') return buildNumberInstance(instance);
    else if (typeof instance === 'string') return buildStringInstance(instance);
  };

  return recursion(instance);
}

/**
 * Evaluates if a given JSON instance is of a primitive type (`boolean`, `null`,
 * `number` or `string`).
 *
 * @param {any} instance The JSON instance to be evaluated.
 *
 * @returns {boolean} A boolean set to `true` if the function evaluates
 * positive, `false` otherwise.
 */
function isJsonPrimitiveType(instance) {
  return instance === null ||
    ['boolean', 'number', 'string'].includes(typeof instance)
    ? true
    : false;
}

/**
 * Generates a string from a given instance to be used as title.
 *
 * @param {any} instance The JSON instance from which to extract a title.
 * @param {string} arraySubstitute A string to be shown as title of an instance
 * corresponding to a JSON Schema `array` type.
 * @param {string} objectSubstitute A string to be shown as title of an instance
 * corresponding to a JSON Schema `object` type.
 * @param {Function} booleanTranslateFunction A function that maps boolean
 * values into strings.
 *
 * @returns {string} The generated title.
 */
function instanceAsTitle(
  instance,
  arraySubstitute,
  objectSubstitute,
  booleanTranslateFunction
) {
  if (Array.isArray(instance)) {
    const span = document.createElement('span');
    const icon = span.appendChild(document.createElement('i'));
    icon.classList.add('fas', 'fa-list');
    span.appendChild(document.createElement('span')).classList.add('mr-2');
    span.appendChild(document.createTextNode(arraySubstitute));
    return span;
  } else if (instance instanceof Object) {
    const span = document.createElement('span');
    const icon = span.appendChild(document.createElement('i'));
    icon.classList.add('fas', 'fa-object-group');
    span.appendChild(document.createElement('span')).classList.add('mr-2');
    span.appendChild(document.createTextNode(objectSubstitute));
    return span;
  } else if (typeof instance === 'boolean')
    return buildBooleanInstance(instance, booleanTranslateFunction);
  else if (instance === null) return buildNullInstance();
  else if (typeof instance === 'number') return buildNumberInstance(instance);
  else if (typeof instance === 'string') return buildStringInstance(instance);
}

/**
 * Builds the DOM representation of a `boolean` JSON instance.
 *
 * @param {boolean} instance The `boolean` JSON instance to present.
 * @param {Function} [booleanTranslateFunction=(b) => b] A function that maps
 * boolean values into strings.
 *
 * @returns {Text} An HTML text node containing the instance representation.
 */
function buildBooleanInstance(instance, booleanTranslateFunction = (b) => b) {
  return document.createTextNode(booleanTranslateFunction(instance));
}

/**
 * Builds the DOM representation of a `null` JSON instance.
 *
 * @returns {Text} An HTML text node containing the instance representation.
 */
function buildNullInstance() {
  return document.createTextNode('Null');
}

/**
 * Builds the DOM representation of a `number` JSON instance.
 *
 * @param {number} instance The `number` JSON instance to present.
 *
 * @returns {Text} An HTML text node containing the instance representation.
 */
function buildNumberInstance(instance) {
  return document.createTextNode(instance);
}

/**
 * Builds the DOM representation of a `string` JSON instance.
 *
 * @param {number} instance The `string` JSON instance to present.
 *
 * @returns {Text} An HTML text node containing the instance representation.
 */
function buildStringInstance(instance) {
  const em = document.createElement('em');
  em.innerText = instance;
  return em;
}

export {
  GeneratorIcon,
  RequiredIcon,
  RootIcon,
  AddButton,
  RemoveButton,
  Toggler,
  BooleanInput,
  NumericInput,
  TextInput,
  InputTitle,
  LabelTitle,
  SelectInstancePanel,
  PillsInstancePanel,
  InstanceViewPanel,
};