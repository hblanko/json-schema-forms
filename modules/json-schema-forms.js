import $RefParser from "@apidevtools/json-schema-ref-parser";

function buildForm(url) {
$RefParser.dereference(url, (err, schema) => {
  if (err) {
    console.error(err);
  }
  else {
  document.getElementById("root").appendChild(
      generate(schema, "CBA")
  );

  document.getElementById("schema").innerHTML = JSON.stringify(schema, null, 2);
  }
});
}

function generate(schema, title) {
  const form = document.createElement("form");
  form.classList.add("form-inline");
  form.appendChild(create(schema, title, {activated: true, required: true, enabled: true}));
  const submitButton = createButton("button", "Submit form", sendForm, "submitter");
  submitButton.classList.add("btn", "btn-primary");
  form.appendChild(submitButton);
  return form;
}

function create(instance, id, state, arrayDatalist = null) {
  let element;

  if(!instance) {
    console.warn("Undefined instance, setting default 'type' to 'string'");
    instance = {type: "string"};
  }

  switch(instance.type) {
    case "array":
      element = (new JSCHArray(id, instance, state, arrayDatalist)).instanceDiv;
      break;

    case "boolean":
      element = (new JSCHBoolean(id, instance, state)).instanceDiv;
      break;

    case "integer":
      element = (new JSCHInteger(id, instance, state, arrayDatalist)).instanceDiv;
      break;

    case "number":
      element = (new JSCHNumber(id, instance, state, arrayDatalist)).instanceDiv;
      break;

    case "object":
      element = (new JSCHObject(id, instance, state, arrayDatalist)).instanceDiv;
      break;

    case "string":
      element = (new JSCHString(id, instance, state, arrayDatalist)).instanceDiv;
      break;

    case "null":
      element = (new JSCHConst(id, instance, state)).instanceDiv;
      break;

    default:
      if(instance.const)
        element = (new JSCHConst(id, instance, state)).instanceDiv;
      else
        element = (new JSCHUntyped(id, instance, state, arrayDatalist)).instanceDiv;
  };

  return element;
}

function createCombiner(id, keyword, combiner) {
  let element;

  switch(keyword) {
    case "allOf":
      element = (new JSCHAllOf(id, combiner)).combinerDiv;
      break;
    case "anyOf":
      element = (new JSCHAnyOf(id, combiner)).combinerDiv;
      break;
    case "oneOf":
      element = (new JSCHOneOf(id, combiner)).combinerDiv;
      break;
    case "not":
      element = (new JSCHNot(id, combiner)).combinerDiv;
      break;
  }

  return element;
}

class JSCHCombiner {
  constructor(id, activated) {
    this.combinerDiv = document.createElement("div");
    this.combinerDiv.id = id;
    this.combinerDiv.classList.add("jsch-combiner");
    this.combinerDiv.jsch = this;

    if(activated)
      this.combinerDiv.classList.add("activated");
  }

  isActivated() {
    return this.combinerDiv.classList.contains("activated");
  }

  isEnabled() {
    return this.combinerDiv.classList.contains("enabled");
  }

  isRequired() {
    return this.combinerDiv.classList.contains("required");
  }
}

// TODO
class JSCHAllOf extends JSCHCombiner {
  constructor(id, combiner, activated = true) {
    super(id, activated);

    // TODO: Make sure full deep merging is performed
    // instance = merge.apply(this, instance.allOf);
  }
}

class JSCHAnyOf extends JSCHCombiner {
  constructor(id, combiner, activated = true) {
    super(id, activated);

    this.combinerDiv.classList.add("jsch-one-of");
    this.combinerDiv.appendChild(
        document.createElement("h5")
    ).innerHTML = beautifyId(id);

    this.selectorDiv = this.combinerDiv.appendChild(
        buildRadioInputs(id, [...Array(combiner.length).keys()], {
          callback: (i) => {
            this.getSubschema(i).activate();
            this.getSubschema(i).enable();
            this.selectorDiv.childNodes[i].classList.add("active");
            this.getSubschema(i).switchDiv.firstChild.checked = true;

            this.getSubschemas().forEach((s, j) => {
              if(i !== j) {
                s.jsch.deactivate();
                this.selectorDiv.childNodes[j].classList.remove("active");
              }
            });
          }
        })
    );

    this.subschemasDiv = this.combinerDiv.appendChild(
        document.createElement("div")
    );

    combiner.forEach((s, i) => {
      this.subschemasDiv.appendChild(
          create(s, this.combinerDiv.id + "--" + i, {activated})
      )

      this.subschemasDiv.lastChild.classList.add("jsch-combiner-subschema");
    });

    this.initState(activated);
  }

  getSubschema(i) {
    return this.subschemasDiv.childNodes[i].jsch;
  }

  getSubschemas() {
    return this.subschemasDiv.childNodes;
  }

  activate() {
    this.combinerDiv.classList.add("activated");

    this.enable();
  }

  deactivate() {
    this.combinerDiv.classList.remove("activated");

    this.subschemasDiv.childNodes.forEach((s, i) => {
      this.selectorDiv.childNodes[i].firstChild.disabled = true;
      s.jsch.deactivate();
    });
  }

  enable() {
    this.combinerDiv.classList.add("enabled");

    this.getSubschemas().forEach((s, i) => {
      this.selectorDiv.childNodes[i].firstChild.disabled = false;

      if(this.selectorDiv.childNodes[i].firstChild.checked) {
        s.jsch.activate();
        s.jsch.enable();
      } else
        s.jsch.deactivate();
    });
  }

  disable() {
    this.combinerDiv.classList.remove("enabled");

    this.subschemasDiv.childNodes.forEach((s, i) => {
      this.selectorDiv.childNodes[i].firstChild.disabled = true;
      s.jsch.deactivate();
    });
  }

  initState(activated) {
    this.selectorDiv.firstChild.firstChild.checked = true;
    this.subschemasDiv.firstChild.jsch.switchDiv.firstChild.checked = true;

    if(activated)
      this.activate();
    else
      this.deactivate();
  }
}

class JSCHOneOf extends JSCHAnyOf {
  constructor(id, combiner, activated = true) {
    super(id, combiner, activated);
  }
}

class JSCHInstance {
  constructor(id, instance, state) {
    this.instanceDiv = document.createElement("div");
    this.instanceDiv.id = id;
    this.instanceDiv.classList.add("jsch-instance", "container-fluid");
    this.instanceDiv.jsch = this;

    this.headerDiv = this.instanceDiv.appendChild(
        document.createElement("div")
    );

    this.headerDiv.classList.add("form-group");

    this.annotations = collectAnnotations(instance);

    if(state.required)
      this.instanceDiv.classList.add("required");
    else {
      this.switchDiv = this.headerDiv.appendChild(
          document.createElement("div")
      );

      this.switchDiv.classList.add("custom-control", "custom-switch");

      const input = this.switchDiv.appendChild(
          document.createElement("input")
      );

      input.type = "checkbox";
      input.id = id + "--switch";
      input.classList.add("custom-control-input");

      input.addEventListener("click", this.switchCallback.bind(this));

      const label = this.switchDiv.appendChild(
          document.createElement("label")
      );

      label.htmlFor = input.id;
      label.classList.add("custom-control-label", "mr-sm-1");
    }

    if(state.activated) {
      this.instanceDiv.classList.add("activated");

      if(state.enabled)
        this.instanceDiv.classList.add("enabled");
    }
  }

  isActivated() {
    return this.instanceDiv.classList.contains("activated");
  }

  isEnabled() {
    return this.instanceDiv.classList.contains("enabled");
  }

  isRequired() {
    return this.instanceDiv.classList.contains("required");
  }

  setCombiners(id, instance) {
    if(instance.oneOf || instance.allOf || instance.anyOf || instance.not) {
      this.combinersDiv = this.instanceDiv.appendChild(document.createElement("div"));

      if(instance.allOf)
        this.combinersDiv.appendChild(createCombiner(id + "__jsch:all-of", "allOf", instance.allOf));

      if(instance.anyOf)
        this.combinersDiv.appendChild(createCombiner(id + "__jsch:any-of", "anyOf", instance.anyOf));

      if(instance.oneOf)
        this.combinersDiv.appendChild(createCombiner(id + "__jsch:one-of", "oneOf", instance.oneOf));

      if(instance.not)
        this.combinersDiv.appendChild(createCombiner(id + "__jsch:not", "not", instance.not));
    }
  }

  getCombiners() {
    const combiners = new Array();

    if(this.combinersDiv)
      this.combinersDiv.childNodes.forEach(c => {
        combiners.push(c);
      });

    return combiners;
  }

  switchCallback() {
    if(this.isEnabled())
      this.disable();
    else
      this.enable();
  }
}

class JSCHUntyped extends JSCHInstance {
  constructor(id, instance, state, arrayDatalist = null) {
    super(id, instance, state);

    this.instanceDiv.classList.add("jsch-untyped");
    this.headerDiv.appendChild(
        document.createElement("label")
    ).appendChild(
        document.createElement("h5")
    ).innerHTML = generateName(instance, id);

    this.setCombiners(id, instance);

    if(arrayDatalist)
      this.datalist = arrayDatalist;
    else if(instance.enum) {
      this.datalist = this.instanceDiv.appendChild(
          buildDatalist(id, instance.enum)
      );
    }

    this.initState();
  }

  activate() {
    this.instanceDiv.classList.add("activated");

    if(!this.isRequired())
      this.switchDiv.firstChild.disabled = false;

    if(this.isRequired() || this.isEnabled())
      this.getCombiners().forEach(c => {
        c.jsch.activate();
      });
  }

  deactivate() {
    this.instanceDiv.classList.remove("activated");

    if(!this.isRequired())
      this.switchDiv.firstChild.disabled = true;

    this.getCombiners().forEach(c => {
      c.jsch.deactivate();
    });
  }

  enable() {
    this.instanceDiv.classList.add("enabled");
//    this.setToggleButtonText("Disable");

    this.getCombiners().forEach(c => {
      c.jsch.activate();
    });
  }

  disable() {
    this.instanceDiv.classList.remove("enabled");
//    this.setToggleButtonText("Enable");

    this.getCombiners().forEach(c => {
      c.jsch.deactivate();
    });
  }

  initState() {
    if(this.isRequired() || this.isEnabled()) {
      if(this.switchDiv)
        this.switchDiv.firstChild.checked = true;

      this.enable();
    } else {
      if(this.switchDiv)
        this.switchDiv.firstChild.checked = false;

      this.disable();
    }

    if(!this.isActivated())
      this.deactivate();
  }
}

class JSCHConst extends JSCHInstance {
  constructor(id, instance, state) {
    super(id, instance, state);

    this.instanceDiv.classList.add("jsch-const");
    this.instanceDiv.classList.add("form-group");

    const label = this.instanceDiv.appendChild(
        document.createElement("label")
    );

    label.htmlFor = id + "--input";
    label.innerHTML = generateName(instance, id);

    this.const = this.instanceDiv.appendChild(buildTextInput(id));
    this.const.value = instance.const;
    this.initState();
  }

  getValue() {
    return this.const.value;
  }

  activate() {
    this.instanceDiv.classList.add("activated");
  }

  deactivate() {
    this.instanceDiv.classList.remove("activated");
  }

  enable() {
    this.instanceDiv.classList.add("enabled");
  }

  disable() {
    this.instanceDiv.classList.remove("enabled");
  }

  initState() {
    this.const.readOnly = true;

    if(!this.isActivated())
      this.deactivate();
  }
}

class JSCHNull extends JSCHInstance {
  constructor(id, instance, state) {
    super(id, instance, state);

    this.instanceDiv.classList.add("jsch-null");
    this.instanceDiv.classList.add("form-group");

    const label = this.instanceDiv.appendChild(
        document.createElement("label")
    );

    label.htmlFor = id + "--input";
    label.innerHTML = generateName(instance, id);

    this.extractKeywords(instance);

    this.null = this.instanceDiv.appendChild(buildTextInput(id));
    this.null.value = "null";
    this.initState();
  }

  extractKeywords(instance) {
    this.keywords = {
      type: instance.type
    };
  }

  getValue() {
    return this.null.value;
  }

  activate() {
    this.instanceDiv.classList.add("activated");
  }

  deactivate() {
    this.instanceDiv.classList.remove("activated");
  }

  enable() {
    this.instanceDiv.classList.add("enabled");
  }

  disable() {
    this.instanceDiv.classList.remove("enabled");
  }

  initState() {
    this.const.readOnly = true;

    if(!this.isActivated())
      this.deactivate();
  }
}

class JSCHObject extends JSCHInstance {
  constructor(id, instance, state, arrayDatalist = null) {
    super(id, instance, state);

    this.instanceDiv.classList.add("jsch-object");
    this.headerDiv.appendChild(
        document.createElement("label")
    ).appendChild(
        document.createElement("h5")
    ).innerHTML = generateName(instance, id);

    this.extractKeywords(instance);

    if(arrayDatalist)
      this.datalist = arrayDatalist;
    else if(this.keywords.enum) {
      this.datalist = this.instanceDiv.appendChild(
          buildDatalist(id, this.keywords.enum)
      );
    }

    if(this.keywords.properties)
      Object.keys(this.keywords.properties).forEach(propertyKey => {
        if(this.keywords.required && this.keywords.required.includes(propertyKey))
          this.addProperty(propertyKey, true);
        else
          this.addProperty(propertyKey, false);
      });

    if(this.keywords.additionalProperties) {
      this.additionalPropertiesDiv = this.instanceDiv.appendChild(
          document.createElement("div")
      );

      this.additionalPropertiesDiv.classList.add("additional-properties");

      this.addAPButton = this.additionalPropertiesDiv.appendChild(
          document.createElement("button")
      );

      this.addAPButton.type = "button";
      this.addAPButton.classList.add("btn", "btn-secondary");
      this.addAPButton.innerHTML = "Add additional property";
      this.addAPButton.addEventListener("click", this.addAPButtonCallback);

      if(this.keywords.minProperties)
        if(this.keywords.properties)
          for(let i = 0; i < this.keywords.minProperties - Object.keys(this.keywords.properties).length; i++)
            this.addAdditionalProperty();
        else
          for(let i = 0; i < this.keywords.minProperties; i++)
            this.addAdditionalProperty();
    }

    this.setCombiners(id, instance);
    this.initState();
  }

  extractKeywords(instance) {
    this.keywords = {
      type: instance.type,
      properties: instance.properties,
      additionalProperties: instance.additionalProperties,
      required: instance.required,
      minProperties: instance.minProperties,
      maxProperties: instance.maxProperties,
      propertyNames: instance.propertyNames,
      patternProperties: instance.patternProperties,
      dependencies: instance.dependencies,
      enum: instance.enum
    };
  }

  activate() {
    this.instanceDiv.classList.add("activated");

    if(!this.isRequired())
      this.switchDiv.firstChild.disabled = false;

    if(this.isRequired() || this.isEnabled())
      this.enable()
  }

  deactivate() {
    this.instanceDiv.classList.remove("activated");

    if(!this.isRequired())
      this.switchDiv.firstChild.disabled = true;

    this.disable(true);
  }

  enable() {
    this.instanceDiv.classList.add("enabled");
//    this.setToggleButtonText("Disable");

    if(this.keywords.properties)
      this.getProperties().forEach(i => {
        i.jsch.activate();
      });

    if(this.keywords.additionalProperties) {
      this.addAPButton.disabled = false;

      this.getAdditionalProperties().forEach(i => {
        i.key.disabled  = false;
        i.value.jsch.activate();
        i.button.disabled = false;
      });
    }
  }

  disable(preserveState = false) {
    if(!preserveState) {
      this.instanceDiv.classList.remove("enabled");
//      this.setToggleButtonText("Enable");
    }

    if(this.keywords.properties)
      this.getProperties().forEach(i => {
        i.jsch.deactivate();
      });

    if(this.keywords.additionalProperties) {
      this.addAPButton.disabled = true;

      this.getAdditionalProperties().forEach(i => {
        i.key.disabled  = true;
        i.value.jsch.deactivate();
        i.button.disabled = true;
      });
    }
  }

  initState() {
    if(this.isRequired() || this.isEnabled()) {
      if(this.switchDiv)
        this.switchDiv.firstChild.checked = true;

      this.enable();
    } else {
      if(this.switchDiv)
        this.switchDiv.firstChild.checked = false;

      this.disable();
    }

    if(!this.isActivated())
      this.deactivate();
  }

  addProperty(propertyKey, required) {
    const state = {required, activated: this.isEnabled(), enabled: false};

    this.instanceDiv.appendChild(
        create(this.keywords.properties[propertyKey], this.instanceDiv.id + "__" + propertyKey, state)
    );
  }

  addAdditionalProperty() {
    let suffix;

    if (!this.getAdditionalProperties().length)
      suffix = 1;
    else
      suffix = parseInt(
          this.additionalPropertiesDiv.lastChild.id.split("-").pop()
      ) + 1;

    const apDiv = this.additionalPropertiesDiv.appendChild(
        document.createElement("div")
    );
    apDiv.id = this.instanceDiv.id + "__jsch:ap-" + suffix;
    apDiv.classList.add("jsch-additional-property");

    const keyDiv = apDiv.appendChild(
        document.createElement("div")
    );

    keyDiv.classList.add("form-group");

    const keyLabel = keyDiv.appendChild(
        document.createElement("label")
    );

    keyLabel.htmlFor = apDiv.id + "--key--input";
    keyLabel.innerHTML = beautifyId(keyLabel.htmlFor);

    keyDiv.appendChild(
        buildTextInput(apDiv.id + "--key")
    );

    const state = {required: true, activated: this.isEnabled(), enabled: this.isEnabled()};

    apDiv.appendChild(
        create(this.keywords.additionalProperties, apDiv.id + "--value", state)
    );

    const removeAPButton = apDiv.appendChild(
        document.createElement("button")
    );

    removeAPButton.type = "button";
    removeAPButton.classList.add("btn", "btn-secondary");
    removeAPButton.innerHTML = "Remove additional property";
    removeAPButton.addEventListener("click", this.removeAPButtonCallback);
  }

  getProperties() {
    const properties = new Array();

    this.instanceDiv.childNodes.forEach(p => {
      if(p.classList.contains("jsch-instance")) {
        properties.push(p);
      }
    });

    return properties;
  }

  getAdditionalProperties() {
    const aps = new Array();

    if (this.additionalPropertiesDiv)
      this.additionalPropertiesDiv.childNodes.forEach(i => {
        if(i.classList.contains("jsch-additional-property")) {
          let ap = new Object();
          ap.key = i.firstChild.lastChild;
          ap.value = i.firstChild.nextElementSibling;
          ap.button = i.lastChild;
          aps.push(ap);
        }
      });

    return aps;
  }

  addAPButtonCallback() {
    const jschObject = this.parentNode.parentNode.jsch;

    if (!jschObject.keywords.maxProperties || jschObject.keywords.maxProperties > jschObject.getAdditionalProperties().length)
      jschObject.addAdditionalProperty();
  }

  removeAPButtonCallback() {
    const jschObject = this.parentNode.parentNode.parentNode.jsch;

    if (!jschObject.keywords.minProperties || jschObject.keywords.minProperties < jschObject.getAdditionalProperties().length)
      this.parentNode.remove();
  }
}

class JSCHArray extends JSCHInstance {
  constructor(id, instance, state, arrayDatalist = null) {
    super(id, instance, state);

    this.instanceDiv.classList.add("jsch-array");
    this.headerDiv.appendChild(
        document.createElement("label")
    ).appendChild(
        document.createElement("h5")
    ).innerHTML = generateName(instance, id);

    this.extractKeywords(instance);

    // TODO: Ensure implementation of tuple-validation and enums of arrays
    if(arrayDatalist)
      this.datalist = arrayDatalist;
    else if(this.keywords.enum) {
      this.datalist = this.instanceDiv.appendChild(
          buildDatalist(id, this.keywords.enum)
      );
    } else if(this.keywords.items && this.keywords.items.enum) { // List validation with enum
      this.datalist = this.instanceDiv.appendChild(
          buildDatalist(id, this.keywords.items.enum)
      );
    }

    this.addArrayItemButton = this.instanceDiv.appendChild(
        document.createElement("button")
    );

    this.addArrayItemButton.type = "button";
    this.addArrayItemButton.classList.add("add-array-item-button");
    this.addArrayItemButton.classList.add("btn", "btn-secondary");
    this.addArrayItemButton.innerHTML = "+";
    this.addArrayItemButton.addEventListener("click", this.addArrayItemButtonCallback);

    if(this.keywords.minItems)
      for(let i = 0; i < this.keywords.minItems; i++)
        this.addArrayItem();

    this.setCombiners(id, instance);
    this.initState();
  }

  extractKeywords(instance) {
    this.keywords = {
      type: instance.type,
      items: instance.items,
      additionalItems: instance.additionalItems,
      contains: instance.contains,
      minItems: instance.minItems,
      maxItems: instance.maxItems,
      uniqueItems: instance.uniqueItems,
      enum: instance.enum
    };
  }

  activate() {
    this.instanceDiv.classList.add("activated");

    if(!this.isRequired())
      this.switchDiv.firstChild.disabled = false;

    if(this.isRequired() || this.isEnabled())
      this.enable();
  }

  deactivate() {
    this.instanceDiv.classList.remove("activated");

    if(!this.isRequired())
      this.switchDiv.firstChild.disabled = true;

    this.disable(true);
  }

  enable() {
    this.instanceDiv.classList.add("enabled");
//    this.setToggleButtonText("Disable");

    this.addArrayItemButton.disabled = false;

    this.getArrayItems().forEach(i => {
      i.lastChild.disabled  = false;
      i.jsch.activate();
    });
  }

  disable(preserveState = false) {
    if(!preserveState) {
      this.instanceDiv.classList.remove("enabled");
//      this.setToggleButtonText("Enable");
    }

    this.addArrayItemButton.disabled = true;

    this.getArrayItems().forEach(i => {
      i.lastChild.disabled  = true;
      i.jsch.deactivate();
    });
  }

  initState() {
    if(this.isRequired() || this.isEnabled()) {
      if(this.switchDiv)
        this.switchDiv.firstChild.checked = true;

      this.enable();
    } else {
      if(this.switchDiv)
        this.switchDiv.firstChild.checked = false;

      this.disable();
    }

    if(!this.isActivated())
      this.deactivate();
  }

  getArrayItems() {
    const arrayItems = new Array();

    this.instanceDiv.childNodes.forEach(i => {
      if(i.classList.contains("jsch-array-item"))
        arrayItems.push(i);
    });

    return arrayItems;
  }

  addArrayItem() {
    let suffix;

    const arrayItems = this.getArrayItems();

    if (arrayItems.length === 0)
      suffix = 1;
    else
      suffix = parseInt(
          arrayItems[arrayItems.length - 1].id.split("-").pop()
      ) + 1;

    const state = {required: true, activated: this.isEnabled(), enabled: false};
    const itemId = this.instanceDiv.id + "__jsch:ai-" + suffix;
    let itemDiv;

    if(this.datalist)
      itemDiv = create(this.keywords.items, itemId, state, this.datalist);
    else
      itemDiv = create(this.keywords.items, itemId, state);

    itemDiv.classList.add("jsch-array-item");

    const removeArrayItemButton = itemDiv.appendChild(
        document.createElement("button")
    );

    removeArrayItemButton.type = "button";
    removeArrayItemButton.classList.add("btn", "btn-secondary");
    removeArrayItemButton.innerHTML = "-";
    removeArrayItemButton.addEventListener("click", this.removeArrayItemButtonCallback);

    this.instanceDiv.appendChild(itemDiv);
  }

  addArrayItemButtonCallback() {
    const jschArray = this.parentNode.jsch;

    if (!jschArray.keywords.maxItems || jschArray.keywords.maxItems > jschArray.getArrayItems().length)
      jschArray.addArrayItem();
  }

  removeArrayItemButtonCallback() {
    const jschArray = this.parentNode.parentNode.jsch;

    if (!jschArray.keywords.minItems || jschArray.keywords.minItems < jschArray.getArrayItems().length)
      this.parentNode.remove();
  }
}

class JSCHLiteralInstance extends JSCHInstance {
  constructor(id, instance, state) {
    super(id, instance, state);

    this.instanceDiv.classList.add("form-group");

    const label = this.instanceDiv.appendChild(
        document.createElement("label")
    );

    label.htmlFor = id + "--input";
    label.innerHTML = beautifyId(id);
  }

  activate() {
    this.instanceDiv.classList.add("activated");

    if(!this.isRequired())
      this.switchDiv.firstChild.disabled = false;

    if(this.isRequired() || this.isEnabled())
      this.enable();
  }

  deactivate() {
    this.instanceDiv.classList.remove("activated");

    if(!this.isRequired())
      this.switchDiv.firstChild.disabled = true;

    this.disable(true);
  }

  enable() {
    this.instanceDiv.classList.add("enabled");
    this.input.disabled = false;
  }

  disable(preserveState = false) {
    if(!preserveState) {
      this.instanceDiv.classList.remove("enabled");
      this.switchDiv.firstChild.checked = false;
    }

    this.input.disabled = true;
  }

  initState() {
    if(this.isRequired() || this.isEnabled()) {
      if(this.switchDiv)
        this.switchDiv.firstChild.checked = true;

      this.enable();
    } else {
      if(this.switchDiv)
        this.switchDiv.firstChild.checked = false;

      this.disable();
    }

    if(!this.isActivated())
      this.deactivate();
  }
}

class JSCHBoolean extends JSCHLiteralInstance {
  constructor(id, instance, state) {
    super(id, instance, state);

    this.instanceDiv.classList.add("jsch-boolean");
    this.instanceDiv.classList.add("custom-control", "custom-checkbox");

    this.input = this.instanceDiv.appendChild(
        buildCheckboxInput(id, "true")
    );

    this.input.id = id + "--input";
    this.input.classList.add("custom-control-input");

    this.label = this.instanceDiv.appendChild(
        document.createElement("label")
    );

    this.label.htmlFor = this.input.id;
    this.label.classList.add("custom-control-label");

    this.initState();
  }

  getValue() {
    if (this.input.checked)
      return true;
    else
      return false;
  }

  check() {
    return true;
  }
}

class JSCHString extends JSCHLiteralInstance {
  constructor(id, instance, state, arrayDatalist = null) {
    super(id, instance, state);

    this.instanceDiv.classList.add("jsch-string");
    this.extractKeywords(instance);

    if(arrayDatalist)
      this.datalist = arrayDatalist;
    else if(this.keywords.enum) {
      this.datalist = this.instanceDiv.appendChild(
          buildDatalist(id, this.keywords.enum)
      );
    }

    if(this.datalist)
      this.input = this.instanceDiv.appendChild(
          buildTextInput(id, this.keywords.pattern, this.datalist.id)
      );
    else
      this.input = this.instanceDiv.appendChild(
          buildTextInput(id, this.keywords.pattern)
      );

    this.setCombiners(id, instance);
    this.initState();
  }

  getValue() {
    return this.input.value;
  }

  extractKeywords(instance) {
    this.keywords = {
      type: instance.type,
      minLength: instance.minLength,
      maxLength: instance.maxLength,
      pattern: instance.pattern,
      format: instance.format, // TODO: Not supported
      enum: instance.enum
    };
  }

  check() {
    const v = this.getValue();
    let valid = true;

    if (this.keywords.pattern)
      valid = valid && RegExp(this.keywords.pattern).test(v);

    if (this.keywords.minLength)
      valid = valid && (v.length >= this.keywords.minLength);

    if (this.keywords.maxLength)
      valid = valid && (v.length <= this.keywords.maxLength);

    if (this.keywords.enum)
      valid = valid && this.keywords.enum.some(o => {
        return v === o;
      });

    return valid;
  }
}

class JSCHInteger extends JSCHLiteralInstance {
  constructor(id, instance, state, arrayDatalist = null) {
    super(id, instance, state);

    this.instanceDiv.classList.add("jsch-integer");
    this.extractKeywords(instance);

    if(arrayDatalist)
      this.datalist = arrayDatalist;
    else if(this.keywords.enum) {
      this.datalist = this.instanceDiv.appendChild(
          buildDatalist(id, this.keywords.enum)
      );
    }

    if(this.datalist)
      this.input = this.instanceDiv.appendChild(
          buildTextInput(id, this.keywords.pattern, this.datalist.id)
      );
    else
      this.input = this.instanceDiv.appendChild(
          buildTextInput(id, "^(-|\\+)?\\d+$")
      );

    this.setCombiners(id, instance);
    this.initState();
  }

  getValue() {
    return parseInt(this.input.value);
  }

  extractKeywords(instance) {
    this.keywords = {
      type: instance.type,
      exclusiveMinimum: instance.exclusiveMinimum,
      exclusiveMaximum: instance.exclusiveMaximum,
      minimum: instance.minimum,
      maximum: instance.maximum,
      multipleOf: instance.multipleOf,
      enum: instance.enum
    };
  }

  check() {
    const v = this.getValue();
    let valid = RegExp("^(-|\\+)?\\d+$").test(v.toString());

    if (this.keywords.exclusiveMinimum)
      valid = valid && (v > this.keywords.exclusiveMinimum);

    if (this.keywords.exclusiveMaximum)
      valid = valid && (v < this.keywords.exclusiveMaximum);

    if (this.keywords.minimum)
      valid = valid && (v >= this.keywords.minimum);

    if (this.keywords.maximum)
      valid = valid && (v <= this.keywords.maximum);

    if (this.keywords.multipleOf)
      valid = valid && (v % parseFloat(this.keywords.multipleOf) === 0);

    if (this.keywords.enum)
      valid = valid && this.keywords.enum.some(o => {
        return v === parseInt(o);
      });

    return valid;
  }
}

class JSCHNumber extends JSCHLiteralInstance {
  constructor(id, instance, state, arrayDatalist = null) {
    super(id, instance, state);

    this.instanceDiv.classList.add("jsch-number");
    this.extractKeywords(instance);

    if(arrayDatalist)
      this.datalist = arrayDatalist;
    else if(this.keywords.enum) {
      this.datalist = this.instanceDiv.appendChild(
          buildDatalist(id, this.keywords.enum)
      );
    }

    if(this.datalist)
      this.input = this.instanceDiv.appendChild(
          buildTextInput(id, this.keywords.pattern, this.datalist.id)
      );
    else
      this.input = this.instanceDiv.appendChild(
          buildTextInput(id, "^(-|\\+)?\\d+(\\.\\d+)*$")
      );

    this.setCombiners(id, instance);
    this.initState();
  }

  getValue() {
    return parseFloat(this.input.value);
  }

  extractKeywords(instance) {
    this.keywords = {
      type: instance.type,
      exclusiveMinimum: instance.exclusiveMinimum,
      exclusiveMaximum: instance.exclusiveMaximum,
      minimum: instance.minimum,
      maximum: instance.maximum,
      multipleOf: instance.multipleOf,
      enum: instance.enum
    };
  }

  check() {
    const v = this.getValue();
    let valid = RegExp("^(-|\\+)?\\d+(\\.\\d+)*$").test(v.toString());

    if (this.keywords.exclusiveMinimum)
      valid = valid && (v > this.keywords.exclusiveMinimum);

    if (this.keywords.exclusiveMaximum)
      valid = valid && (v < this.keywords.exclusiveMaximum);

    if (this.keywords.minimum)
      valid = valid && (v >= this.keywords.minimum);

    if (this.keywords.maximum)
      valid = valid && (v <= this.keywords.maximum);

    if (this.keywords.multipleOf)
      valid = valid && (v % parseFloat(this.keywords.multipleOf) === 0);

    if (this.keywords.enum)
      valid = valid && this.keywords.enum.some(o => {
        return v === parseFloat(o);
      });

    return valid;
  }
}

function buildDatalist(instanceId, enumArray) {
  const datalist = document.createElement("datalist");
  datalist.id = instanceId + "--datalist";

  // TODO: Support for complex objects in datalist
  enumArray.forEach(datum => {
    datalist.appendChild(document.createElement("option")).value = datum;
  });

  return datalist;
}

function buildTextInput(instanceId, pattern = "^.+$", datalistId = null) {
  const input = document.createElement("input");
  input.type = "text";
  input.id = instanceId + "--input";
  input.name = instanceId;
  input.classList.add("form-control", "mx-sm-3");
  input.required = true;

  if (datalistId)
    input.setAttribute("list", datalistId);

  if (pattern)
    input.pattern = pattern;

  return input;
}

function buildCheckboxInput(instanceId, value) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = instanceId;
  input.value = value;
  return input;
}

function buildRadioInputs(instanceId, values, {labels = null, callback = null} = {}) {
  const div = document.createElement("div");

  div.classList.add("btn-group", "btn-group-toggle");
  div.dataset.toggle = instanceId;

  values.forEach((v, i) => {

    const label = div.appendChild(
        document.createElement("label")
    );

    const input = label.appendChild(
        document.createElement("input")
    );

    input.type = "radio";
    input.id = instanceId + "--" + i.toString();
    input.name = instanceId;
    input.value = v;

    if(!i) {
      label.classList.add("btn", "btn-secondary", "active");
      input.checked = true;
    } else
      label.classList.add("btn", "btn-secondary");

    if(labels)
      label.appendChild(
          document.createTextNode(labels[i])
      );
    else
      label.appendChild(
          document.createTextNode("Option " + i.toString())
      );

    if (callback)
      input.addEventListener("change", () => { callback(i); });
  });

  return div;
}

function createButton(type, text, callback, classList = "disableable") {
  const buttonElement = document.createElement("button");
  buttonElement.type = type;

  if(classList)
    buttonElement.className = classList;

  buttonElement.innerHTML = text;
  buttonElement.addEventListener("click", callback);
  return buttonElement;
}

function generateName(instance, id) {
  if (instance.title)
    return instance.title;
  else
    return beautifyId(id);
}

function beautifyId(id) {
  // TODO
  return id.split("__").pop();
}

function collectAnnotations(instance) {
  const annotations = new Object();

  if(instance.title !== undefined)
    annotations.title = instance.title;

  if(instance.description !== undefined)
    annotations.description = instance.description;

  if(instance.default !== undefined)
    annotations.default = instance.default;

  if(instance.examples !== undefined)
    annotations.examples = instance.examples;

  return annotations;
}

function htmlizeRegex(pattern) {
  // TODO
  return pattern;
}

//let merge = (...arguments) => {
//
//  // Variables
//  let target = {};
//  let i = 0;
//
//  // Merge the object into the target object
//  let merger = (obj) => {
//   for (let prop in obj) {
//       if (obj.hasOwnProperty(prop)) {
//           if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
//               // If we're doing a deep merge and the property is an object
//               target[prop] = merge(target[prop], obj[prop]);
//           } else {
//               // Otherwise, do a regular merge
//               target[prop] = obj[prop];
//           }
//       }
//   }
//  };
//
//  //Loop through each object and conduct a merge
//  for (; i < arguments.length; i++) {
//   merger(arguments[i]);
//  }
//
//  return target;
//};

function extractKey(element) {
  let key;

  if(element.parentNode.classList.contains("jsch-additional-property"))
    key = element.previousElementSibling.lastChild.value;
  else if(element.classList.contains("jsch-array-item"))
    key = extractKey(element.parentNode);
  else if(element.classList.contains("jsch-combiner-subschema"))
    key = extractKey(element.parentNode.parentNode.parentNode.parentNode);
  else
    key = element.id.split("__").pop();

  return key;
}

function checkFormFields(element, parentObject, checkResults) {
  const key = extractKey(element);

  if(element.classList.contains("jsch-array")) {
    if(!element.jsch.isEnabled())
      return;

    let p;

    if(element.classList.contains("jsch-array-item")) {
      const len = parentObject.push(new Array());
      p = parentObject[len - 1];
    } else {
      parentObject[key] = new Array();
      p = parentObject[key];
    }

    element.jsch.getArrayItems().forEach(e => {
      checkFormFields(e, p, checkResults);
    });
  } else if(element.classList.contains("jsch-object")) {
    if(!element.jsch.isEnabled())
      return;

    let p;

    if(Object.entries(parentObject).length === 0 && parentObject.constructor === Object)
      p = parentObject;
    else if(element.classList.contains("jsch-array-item")) {
      const len = parentObject.push(new Object());
      p = parentObject[len - 1];
    } else {
      parentObject[key] = new Object();
      p = parentObject[key];
    }

    element.jsch.getProperties().forEach(e => {
      checkFormFields(e, p, checkResults);
    });

    element.jsch.getAdditionalProperties().forEach(e => {
      checkFormFields(e.value, p, checkResults);
    });
  } else if(element.classList.contains("jsch-untyped")) {
    if(!element.jsch.isEnabled())
      return;

    element.jsch.getCombiners().forEach(c => {
      if(c.classList.contains("jsch-any-of") || c.classList.contains("jsch-one-of"))
        c.jsch.getSubschemas().forEach(s => {
          if(s.jsch.isActivated())
            checkFormFields(s, parentObject, checkResults);
        });
    });
  } else if(
    element.classList.contains("jsch-boolean") ||
    element.classList.contains("jsch-integer") ||
    element.classList.contains("jsch-number")  ||
    element.classList.contains("jsch-string")
  ) {
    if(!element.jsch.isEnabled())
      return;

    if(element.classList.contains("jsch-array-item"))
      parentObject.push(element.jsch.getValue());
    else
      parentObject[key] = element.jsch.getValue();

    checkResults.set(element.id, element.jsch.check());
  } else if(
    element.classList.contains("jsch-const") ||
    element.classList.contains("jsch-null")
  ) {
    if(element.classList.contains("jsch-array-item"))
      parentObject.push(element.jsch.getValue());
    else
      parentObject[key] = element.jsch.getValue();
  }
}

function getJSONForm(form) {
  const data = new Object();
  const checkResultsMap = new Map();
  checkFormFields(form.firstChild, data, checkResultsMap);
  return [data, checkResultsMap];
}

function sendForm() {
  const form = this.parentNode;
  const [data, checkResultsMap] = getJSONForm(form);

  let valid = true;

  checkResultsMap.forEach((value, key) => {
    if(!value) {
      valid = false;
      console.error(key + " failed");
    }
  });

  if(valid) {
    const postHeaders = new Headers();
    postHeaders.append('Content-Type', 'application/json');

    fetch(serviceUrl, {
      method: "POST",
      headers: postHeaders,
      body: JSON.stringify(data),
    });
  } else
    document.getElementById("result").innerHTML = "Validation failed";
}

export default buildForm;
