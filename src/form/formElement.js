/**
 * Definition and construction of form elements determined by JSON Schemas.
 *
 * @module formElement
 */
import { ArrayHandler, ObjectHandler } from './json-schema/childApplicators.js';
import {
  BooleanInput,
  InputTitle,
  InstanceViewPanel,
  LabelTitle,
  NumericInput,
  PillsInstancePanel,
  RemoveButton,
  RequiredIcon,
  RootIcon,
  SelectInstancePanel,
  TextInput,
  Toggler,
} from './components.js';
import { ElementType, State, TitleType } from './formElementDefinitions.js';
import process from './json-schema/inPlaceApplicators.js';
import JsonSchemaKeywords from './json-schema/JsonSchemaKeywords.js';
import JsonSchemaType from './json-schema/JsonSchemaType.js';
import Layout from './layouts.js';
import createSelectors from './selectors.js';
import formElementByDiv from '../utils/formElementByDiv.js';
import pointerToId from '../utils/pointerToId.js';

/** The form element structure based on a JSON Schema. */
class FormElement {
  /**
   * Class constructor.
   *
   * @param {object} schema Object defining the JSON Schema to be reflected by
   * the form element.
   * @param {object} [parameters] The form element construction parameters.
   * @param {module:formElementDefinitions~ElementType} [parameters.elementType=module:formElementDefinitions~ElementType.ROOT] The
   * type of the form element regarding the way it is created.
   * @param {module:formElementDefinitions~TitleType} [parameters.titleType=module:formElementDefinitions~TitleType.STATIC] The
   * type of the form element title.
   * @param {module:formElementDefinitions~State} [parameters.state=new module:formElementDefinitions~State()] The
   * state of the form element at initialization.
   * @param {string} [parameters.pointer=''] A JSON Pointer-like string that
   * provides unique identification of the JSON Schema being represented by the
   * form element.
   * @param {string} [parameters.propertyKey] The name of the property defined
   * by the provided JSON Schema, only regarded when the child applicator
   * generating the form element is the `properties` applicator.
   * @param {object} [parameters.formOptions={}] Object storing optional
   * parameters for the form element construction.
   * @param {Function} [parameters.removeCallback] The function to be called if
   * the form element is removed, only regarded when the form element is of type
   * `ElementType.REMOVABLE`.
   */
  constructor(
    schema,
    {
      elementType = ElementType.ROOT,
      titleType = TitleType.STATIC,
      state = new State(),
      pointer = '',
      propertyKey = undefined,
      formOptions = {},
      removeCallback = undefined,
    } = {}
  ) {
    /**
     * The type of the form element regarding the way it is created.
     *
     * @type {module:formElementDefinitions~ElementType}
     */
    this.elementType = elementType;

    /**
     * The type of the form element title.
     *
     * @type {module:formElementDefinitions~TitleType}
     */
    this.titleType = titleType;

    /**
     * The state of the form element at initialization.
     *
     * @type {module:formElementDefinitions~State}
     */
    this.state = state;

    /**
     * A JSON Pointer-like string that provides unique identification of the
     * JSON Schema being represented by the form element.
     *
     * @type {string}
     */
    this.pointer = pointer;

    /**
     * The name of the property defined by the provided JSON Schema, only
     * regarded when the child applicator generating the form element is the
     * `properties` applicator.
     *
     * @member {string} propertyKey
     *
     * @memberof module:formElement~FormElement
     *
     * @instance
     */
    if (propertyKey) this.propertyKey = propertyKey;

    /**
     * Object storing optional parameters for the form element construction.
     *
     * @type {object}
     */
    this.formOptions = formOptions;

    /**
     * The function to be called if the form element is removed, only regarded
     * when the form element is of type `ElementType.REMOVABLE`.
     *
     * @member {Function} removeCallback
     *
     * @memberof module:formElement~FormElement
     *
     * @instance
     */

    if (removeCallback) this.removeCallback = removeCallback;

    /**
     * The set of JSON Schema keywords that are currently represented by the
     * form element.
     *
     * @member {object} keywords
     *
     * @memberof module:formElement~FormElement
     *
     * @instance
     */

    /**
     * The root node of a tree representation of the possible forms that the
     * JSON Schema may possibly take considering its in-place applicators.
     *
     * @member {module:inPlaceApplicators~IPASchema} inPlaceApplicationTree
     *
     * @memberof module:formElement~FormElement
     *
     * @instance
     */

    const inPlaceApplicationTree = process(schema);

    if (inPlaceApplicationTree.applicatorByPointer.size) {
      this.inPlaceApplicationTree = inPlaceApplicationTree;
      this.keywords = this.inPlaceApplicationTree.getSelectedSchema();
    } else this.keywords = inPlaceApplicationTree.common;

    /**
     * The title icon component of the form element.
     *
     * @type {module:components~Component}
     */
    this.titleIcon = buildTitleIcon(this);

    /**
     * The title component of the form element.
     *
     * @type {module:components~Component}
     */
    this.title = buildTitle(this);

    /**
     * The function to be called if the form element is removed, only regarded
     * when the form element is of type `ElementType.REMOVABLE`.
     *
     * @member {module:selectors~SelectorsContainer} selectors
     *
     * @memberof module:formElement~FormElement
     *
     * @instance
     */

    if (this.inPlaceApplicationTree) this.selectors = buildSelectors(this);

    /**
     * The content of the form element, complying the JSON Schema
     * specifications.
     *
     * @type {module:components~Component}
     */
    this.content = buildContent(this);

    if (
      formOptions.initTogglersOff &&
      elementType === ElementType.OPTIONAL &&
      (!state.active || state.disabled)
    )
      this.content.domElement.classList.add('disabled');

    if (titleType !== TitleType.FIELD) setLabelReference(this);

    /**
     * The layout object generating and keeping the DOM references to the form
     * element representation.
     *
     * @type {module:layouts~Layout}
     */
    this.layout = new Layout(this);
    formElementByDiv.set(this.layout.root, this);
  }

  /**
   * Rebuilds a form element after using the current in-place applicators
   * selection.
   */
  rebuild() {
    this.keywords = this.inPlaceApplicationTree.getSelectedSchema();
    this.content = buildContent(this);

    if (this.titleType !== TitleType.FIELD) setLabelReference(this);

    this.layout.updateContentPane(this);
  }

  /**
   * Checks if the form element is enabled.
   *
   * @returns {boolean} `true` if the form element is enabled (that is, fully
   * interactive), `false` otherwise.
   */
  isEnabled() {
    return this.state.active && !this.state.disabled;
  }

  /**
   * Activates the form element, allowing it to be either partially or fully
   * interacted with respect to its current state.
   */
  activate() {
    if (!this.state.active) {
      if (this.elementType !== ElementType.REMOVABLE) this.titleIcon.enable();

      this.state.active = true;

      if (!this.state.disabled) this.enable();
    }
  }

  /** Deactivates the form element, disallowing any interaction. */
  deactivate() {
    if (this.state.active) {
      if (this.elementType !== ElementType.REMOVABLE) this.titleIcon.disable();

      this.state.active = false;

      if (!this.state.disabled) this.disable();
    }
  }

  /** Enables the form element, allowing it to be fully interacted. */
  enable() {
    if (this.selectors) this.selectors.enable();

    if (this.titleType === TitleType.FIELD) this.title.enable();

    if (this.state.disabled) this.state.disabled = false;

    this.content.enable();
    this.content.domElement.classList.remove('disabled');
  }

  /**
   * Disables the form element, disallowing any interaction other than its
   * icon.
   */
  disable() {
    if (this.selectors) this.selectors.disable();

    if (this.titleType === TitleType.FIELD) this.title.disable();

    if (this.state.active) this.state.disabled = true;

    this.content.disable();
    this.content.domElement.classList.add('disabled');
  }

  /**
   * Retrieves the JSON instance expressed by the form element together with the
   * inputted values.
   *
   * @returns {any} The JSON instance associated to the form element.
   */
  getInstance() {
    if (
      this.keywords.type === JsonSchemaType.ARRAY ||
      this.keywords.type === JsonSchemaType.OBJECT
    )
      return this.content.getInstance();
    else return this.content.getValue();
  }
}

/**
 * Builds the selector toolbars that allow to choose among the possible JSON
 * Schema materializations regarding its in-place applicators.
 *
 * @param {module:formElement~FormElement} fe The form element which the
 * selector toolbar will be built for.
 *
 * @returns {module:selectors~SelectorsContainer} The container handling the
 * selector toolbars.
 *
 * @modifies fe
 */
function buildSelectors(fe) {
  const selectorCallback = (id, pointer, selectorIndex, dropdownItemIndex) => {
    fe.selectors.update(
      id,
      pointer,
      selectorIndex,
      dropdownItemIndex,
      selectorCallback
    );

    fe.rebuild();
  };

  return createSelectors(
    pointerToId(fe.pointer),
    fe.inPlaceApplicationTree,
    selectorCallback,
    fe.elementType === ElementType.OPTIONAL
      ? fe.formOptions.initTogglersOff
      : false
  );
}

/**
 * Builds a title icon component.
 *
 * @param {module:formElement~FormElement} fe The form element which the title
 * icon will be built for.
 *
 * @returns {module:components~Component} The title icon component.
 */
function buildTitleIcon(fe) {
  const titleIconCase = {
    [ElementType.ROOT]: {
      c: RootIcon,
      args: [
        {
          fontAwesome: fe.formOptions.fontAwesome,
        },
      ],
    },
    [ElementType.REMOVABLE]: {
      c: RemoveButton,
      args: [
        () => void fe.removeCallback(),
        {
          disabled: !fe.state.active,
        },
        {
          bootstrap: fe.formOptions.bootstrap,
          fontAwesome: fe.formOptions.fontAwesome,
        },
      ],
    },
    [ElementType.REQUIRED]: {
      c: RequiredIcon,
      args: [
        {
          fontAwesome: fe.formOptions.fontAwesome,
        },
      ],
    },
    [ElementType.OPTIONAL]: {
      c: Toggler,
      args: [
        pointerToId(fe.pointer),
        () => {
          if (fe.state.disabled) fe.enable();
          else fe.disable();
        },
        {
          disabled: !fe.state.active,
          initOff: fe.state.disabled || fe.formOptions.initTogglersOff,
        },
        {
          bootstrap: fe.formOptions.bootstrap,
        },
      ],
    },
  }[fe.elementType];

  return titleIconCase ? new titleIconCase.c(...titleIconCase.args) : null;
}

/**
 * Builds a title component.
 *
 * @param {module:formElement~FormElement} fe The form element which the title
 * will be built for.
 *
 * @returns {module:components~Component} The title component.
 */
function buildTitle(fe) {
  const titleCase = {
    [TitleType.FIELD]: {
      c: InputTitle,
      args: [
        pointerToId(fe.pointer),
        {
          disabled: !fe.state.active || fe.state.disabled,
          placeholder: fe.keywords.title || fe.propertyKey,
        },
        {
          bootstrap: fe.formOptions.bootstrap,
        },
      ],
    },
    [TitleType.STATIC]: {
      c: LabelTitle,
      args: [
        fe.keywords.title ||
          (fe.elementType === ElementType.REMOVABLE
            ? fe.formOptions.arrayItemTitle
            : fe.pointer.split('-').pop()),
        fe.keywords.description,
        {
          htmlFor:
            fe.content && fe.content.input ? fe.content.input.id : undefined,
        },
        {
          bootstrap: fe.formOptions.bootstrap,
          fontAwesome: fe.formOptions.fontAwesome,
        },
      ],
    },
    [TitleType.ADDED_ITEM]: {
      c: LabelTitle,
      args: [
        fe.formOptions.arrayItemTitle,
        fe.keywords.description,
        {
          htmlFor:
            fe.content && fe.content.input ? fe.content.input.id : undefined,
        },
        {
          bootstrap: fe.formOptions.bootstrap,
          fontAwesome: fe.formOptions.fontAwesome,
        },
      ],
    },
  }[fe.titleType];

  return titleCase ? new titleCase.c(...titleCase.args) : null;
}

/**
 * Builds the form element content based on its associated JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * component will be built for.
 *
 * @returns {module:components~Component} The content component.
 */
function buildContent(fe) {
  if (
    Object.keys(fe.keywords).includes(
      JsonSchemaKeywords.GenericValidation.CONST
    ) ||
    Object.keys(fe.keywords).includes(JsonSchemaKeywords.GenericValidation.ENUM)
  )
    return buildEnum(fe);
  else {
    if (!fe.keywords.type)
      console.warn(`No "type" keyword assigned to ${fe.pointer}. Setting \
fallback type to "string".`);
    return {
      [JsonSchemaType.ARRAY]: buildArray,
      [JsonSchemaType.BOOLEAN]: buildBoolean,
      [JsonSchemaType.INTEGER]: buildNumber,
      [JsonSchemaType.NULL]: buildNull,
      [JsonSchemaType.NUMBER]: buildNumber,
      [JsonSchemaType.OBJECT]: buildObject,
      [JsonSchemaType.STRING]: buildString,
    }[fe.keywords.type || JsonSchemaType.STRING](fe);
  }
}

/**
 * Builds the form element content of an `array`-typed JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * component will be built for.
 *
 * @returns {module:childApplicators~ArrayHandler} The component handling the
 * `array`-typed JSON Schema.
 */
function buildArray(fe) {
  return new ArrayHandler(fe);
}

/**
 * Builds the form element content of a `boolean`-typed JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * component will be built for.
 *
 * @returns {module:components~InputComponent} The component presenting an input
 * control for the `boolean`-typed JSON Schema.
 */
function buildBoolean(fe) {
  return new BooleanInput(
    pointerToId(fe.pointer),
    {
      disabled: !fe.isEnabled(),
      form: fe.formOptions.formId,
    },
    {
      bootstrap: fe.formOptions.bootstrap,
    }
  );
}

/**
 * Builds the form element content of an `enum` JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * component will be built for.
 *
 * @returns {module:components~InputComponent} The component presenting an input
 * control for the `enum` JSON Schema.
 */
function buildEnum(fe) {
  if (fe.keywords.const)
    return new InstanceViewPanel(
      fe.keywords.const,
      fe.formOptions.booleanTranslateFunction,
      {
        bootstrap: fe.formOptions.bootstrap,
      }
    );
  else if (fe.keywords.enum.length === 1)
    return new InstanceViewPanel(
      fe.keywords.enum[0],
      fe.formOptions.booleanTranslateFunction,
      {
        bootstrap: fe.formOptions.bootstrap,
      }
    );
  else if (
    fe.formOptions.bootstrap &&
    fe.keywords.enum.length <= fe.formOptions.maxEnumTabs &&
    fe.keywords.enum.some((i) => i instanceof Object)
  )
    return new PillsInstancePanel(
      pointerToId(fe.pointer),
      fe.keywords.enum,
      fe.formOptions.objectSubstitute,
      fe.formOptions.arraySubstitute,
      fe.formOptions.booleanTranslateFunction,
      {
        bootstrap: fe.formOptions.bootstrap,
        fontAwesome: fe.formOptions.fontAwesome,
      }
    );
  else
    return new SelectInstancePanel(
      pointerToId(fe.pointer),
      fe.keywords.enum,
      fe.formOptions.objectSubstitute,
      fe.formOptions.arraySubstitute,
      fe.formOptions.booleanTranslateFunction,
      0,
      {
        disabled: !fe.isEnabled(),
        multiple: true,
        size: fe.formOptions.maxSelectSize,
      },
      {
        bootstrap: fe.formOptions.bootstrap,
        fontAwesome: fe.formOptions.fontAwesome,
      }
    );
}

/**
 * Builds the form element content of a `null`-typed JSON Schema.
 *
 * @returns {module:components~Component} The component presenting the `null`
 * -typed JSON Schema.
 */
function buildNull() {
  const nullDiv = document.createElement('div');
  nullDiv.innerText = 'null';

  const content = {
    domElement: nullDiv,
    enable() {},
    disable() {},
    getValue() {
      return null;
    },
  };

  return content;
}

/**
 * Builds the form element content of a `number`-typed JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * component will be built for.
 *
 * @returns {module:components~InputComponent} The component presenting an input
 * control for the `number`-typed JSON Schema.
 */
function buildNumber(fe) {
  let max;
  let min;
  let step;

  // Handles case of "integer" type by configuring the "step" attribute
  // accordingly.
  if (fe.keywords.type === JsonSchemaType.INTEGER) {
    if (fe.keywords.multipleOf) {
      if (Math.floor(fe.keywords.multipleOf) === fe.keywords.multipleOf)
        step = fe.keywords.multipleOf;
      else {
        const n = fe.keywords.multipleOf.toString().split('.')[1].length - 1;

        for (const i of [2 * 10 ** n, 5 * 10 ** n, 10 * 10 ** n]) {
          const q = fe.keywords.multipleOf * i;

          if (Math.floor(q) === q) {
            step = q;
            break;
          }
        }
      }
    } else step = 1;
  } else step = fe.keywords.multipleOf;

  // Prioritizes "exclusiveMaximum" over "maximum".
  max = fe.keywords.exclusiveMaximum || fe.keywords.maximum;

  if (max) {
    if (step) {
      max = Math.floor(max / step) * step;
      max =
        Math.floor(max) === max
          ? max
          : max.toFixed(step.toString().split('.')[1].length);
    }

    if (fe.keywords.exclusiveMaximum && fe.keywords.exclusiveMaximum === max)
      max = step ? max - step : max - 1;
  }

  // Prioritizes "exclusiveMinimum" over "minimum".
  min = fe.keywords.exclusiveMinimum || fe.keywords.minimum;

  if (min) {
    min = step ? Math.ceil(min / step) * step : min;

    if (fe.keywords.exclusiveMinimum && fe.keywords.exclusiveMinimum === min)
      min = step ? min + step : min + 1;
  }

  return new NumericInput(
    pointerToId(fe.pointer),
    {
      disabled: !fe.isEnabled(),
      form: fe.formOptions.formId,
      max,
      min,
      step,
    },
    {
      bootstrap: fe.formOptions.bootstrap,
    }
  );
}

/**
 * Builds the form element content of an `object`-typed JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * component will be built for.
 *
 * @returns {module:childApplicators~ObjectHandler} The component handling the
 * `object`-typed JSON Schema.
 */
function buildObject(fe) {
  return new ObjectHandler(fe);
}

/**
 * Builds the form element content of a `string`-typed JSON Schema.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * component will be built for.
 *
 * @returns {module:components~InputComponent} The component presenting an input
 * control for the `string`-typed JSON Schema.
 */
function buildString(fe) {
  return new TextInput(
    pointerToId(fe.pointer),
    {
      disabled: !fe.isEnabled(),
      form: fe.formOptions.formId,
      maxlength: fe.keywords.maxLength,
      minlength: fe.keywords.minLength,
      pattern: fe.keywords.pattern,
    },
    {
      bootstrap: fe.formOptions.bootstrap,
    }
  );
}

/**
 * Sets the title label of a form element to point to its referred input
 * control.
 *
 * @param {module:formElement~FormElement} fe The form element which the content
 * component will be built for.
 *
 * @modifies fe
 */
function setLabelReference(fe) {
  const id =
    fe.keywords.type !== JsonSchemaType.ARRAY &&
    fe.keywords.type !== JsonSchemaType.OBJECT &&
    fe.keywords.type !== JsonSchemaType.NULL
      ? fe.content.getId()
      : undefined;

  if (id) fe.title.setLabelFor(id);
}

export default FormElement;
