function generate(schema, title) {
  const form = document.createElement("form");
  form.id = title;
  form.onsubmit = sendForm;
  form.appendChild(create(schema, {}, title, null, false));
  const submitInput = document.createElement("input");
  submitInput.type = "submit";
  submitInput.value = "Submit";
  form.appendChild(submitInput);
  initialize(form);
  return form;
}

function initialize(form) {
  // TODO: Initialize with minItems and minProperties
  // TODO: Remove unnecessary buttons (and include the logic into button callbacks)
  enable(form.firstChild, false);
}

function enableOneOf(oneOfObject, enforce) {
//  debugger;
  if(oneOfObject.querySelector(":scope > .disableable")) {
    oneOfObject.querySelector(":scope > .disableable").disabled = false;
    oneOfObject.querySelector(":scope > .disableable").dataset.state = "enabled";
  }

  oneOfObject.lastChild.childNodes.forEach((e, i) => {
//    debugger;
    if(i === 0) {
      e.parentNode.previousElementSibling.childNodes[i].dataset.state = "enabled";
      e.parentNode.previousElementSibling.childNodes[i].disabled = true;
      enable(e, enforce);
    } else {
      e.parentNode.previousElementSibling.childNodes[i].dataset.state = "disabled";
      e.parentNode.previousElementSibling.childNodes[i].disabled = false;
      e.querySelectorAll(".disableable").forEach(o => {
        o.disabled = true;
      });
    }
  });
}

function enable(object, enforce = true) {
  // if one-of -> disable all but Option 0
  if(!object.classList.contains("required") && !enforce) {
    disable(object);
  } else {
    if(object.classList.contains("array")) {
      if(object.querySelector(":scope > .disableable")) {
        object.querySelector(":scope > .disableable").disabled = false;
        object.querySelector(":scope > .disableable").dataset.state = "enabled";
      }

      object.querySelector(":scope > .add-button").disabled = false;
      object.childNodes.forEach(e => {
        if(e.classList.contains("array-item"))
          enable(e);
      });
    } else if(object.classList.contains("object")) {
      if(object.querySelector(":scope > .disableable")) {
        object.querySelector(":scope > .disableable").disabled = false;
        object.querySelector(":scope > .disableable").dataset.state = "enabled";
      }

      object.childNodes.forEach(e => {
        if(e.classList.contains("array") ||
           e.classList.contains("const") ||
           e.classList.contains("integer") ||
           e.classList.contains("object") ||
           e.classList.contains("one-of") ||
           e.classList.contains("string"))
          enable(e, false);
        else if(e.classList.contains("additional-properties")) {
          e.childNodes.forEach(o => {
            if(o.classList.contains("disableable"))
              o.disabled = false;
            else if(o.classList.contains("additional-property"))
              o.childNodes.forEach(u => {
                if(u.classList.contains("disableable"))
                  u.disabled = false;
                else
                  enable(u);
              })
          });
        }
      });
    } else if(object.classList.contains("one-of"))
      enableOneOf(object, enforce);
    else if(object.classList.contains("integer") ||
            object.classList.contains("string"))
      object.querySelectorAll(":scope > .disableable").forEach(e => {
        e.disabled = false;
      });
    else if(object.classList.contains("const"))
      object.lastChild.disabled = true;
  }
}

function disable(object) {
  object.querySelectorAll(".disableable").forEach(e => {
    if(e.classList.contains("toggler") && e.parentNode === object) {
      e.disabled = false;
      e.dataset.state = "disabled";
    } else {
      e.disabled = true;
      if(e.classList.contains("toggler") || e.classList.contains("one-of-toggler"))
        e.dataset.state = "disabled";
    }
  });
}

function create(object, checking, id, datalistId = null, required = true, aioop = false) {
  let element;
  let datalistElement = null;

  if(object.const) {
    element = createTextInputWithLabel(id, "const", "const", null, null, required);
    element.lastChild.value = object.const;
    element.lastChild.disabled = true;
    return element;
  }

  if(object.allOf)
    // TODO: Make sure full deep merging is performed
    object = merge.apply(this, object.allOf);
  else if (object.oneOf) {
    element = initElement(id, "one-of", required);
    
    oneOfButtonsDiv = document.createElement("div");
    oneOfOptionsDiv = document.createElement("div");
    element.appendChild(oneOfButtonsDiv);
    element.appendChild(oneOfOptionsDiv);
    object.oneOf.forEach((option, i) => {
      oneOfButtonsDiv.appendChild(createOneOfButton(i));
      oneOfOptionsDiv.appendChild(
        create(option, checking, id + "__one-of__" + i, datalistId, true)
      );
    });
    return element;
  }

  switch(object.type) {
    case "array":
      if(object.items && object.items.enum) {
        datalistId = id + "__datalist";
        datalistElement = createDatalist(datalistId, object.items.enum);
      }

      element = createArray(object, checking, id, datalistId, required, aioop);
      break;

    case "integer":
      if(object.enum && !datalistId) {
        datalistId = id + "__datalist";
        datalistElement = createDatalist(datalistId, object.enum);
      }

      element = createInteger(object, checking, id, "text", datalistId, required, aioop);
      break;

    case "object":
      element = createObject(object, checking, id, required, aioop);
      break;

    case "string":
      if(object.enum && !datalistId) {
        datalistId = id + "__datalist";
        datalistElement = createDatalist(datalistId, object.enum);
      }

      element = createString(object, checking, id, "text", datalistId, htmlizeRegex(object.pattern), required, aioop);
      break;
  };

  if (datalistElement)
    element.appendChild(datalistElement);

  return element;
}

function initElement(id, type, required, ArrayItemOrObjectProperty = false) {
  const element = document.createElement("div");
  element.id = id;
  element.classList.add(type);

  if(!ArrayItemOrObjectProperty) {
    if(!required)
      element.appendChild(createToggleButton());
    else
      element.classList.add("required");

    element.appendChild(document.createElement("h3")).innerHTML = beautifyId(id);
  }

  return element;
}

function createObject(object, checking, id, required, aioop) {
  function removeAPCallback() {
    if (object.minProperties && object.minProperties < this.parentNode.parentNode.querySelectorAll(":scope > .additional-property").length)
      this.parentNode.remove();
  }

  const objectDiv = initElement(id, "object", required);

  if(object.required)
    object.required.forEach(propertyKey => {
      objectDiv.appendChild(
        create(object.properties[propertyKey], checking, id + "__" + propertyKey, null, true)
      );
//      objectDiv.lastChild.classList.add("required");
    });

  if(object.properties) {
    Object.keys(object.properties).forEach(propertyKey => {
      if(!object.required || !object.required.includes(propertyKey)) 
        objectDiv.appendChild(
          create(object.properties[propertyKey], checking, id + "__" + propertyKey, null, false)
        );
    });
  }

  if(object.additionalProperties) {
    const additionalPropertiesDiv = document.createElement("div");
    additionalPropertiesDiv.classList.add("additional-properties");

    const addPropertyButton = createButton("button", "Add Additional Property", function() {
      const apDiv = this.parentNode;
      
      if(!object.maxProperties || object.maxProperties > apDiv.querySelectorAll(":scope > .additional-property").length)
        addAdditionalProperty(object, checking, objectDiv.id, required, additionalPropertiesDiv, removeAPCallback);
    });
    
    additionalPropertiesDiv.appendChild(addPropertyButton);

    // TODO: Consider already required properties
    if(object.minProperties)
      for(let i = 1; i <= object.minProperties; i++)
        addAdditionalProperty(object, checking, objectDiv.id, required, additionalPropertiesDiv, removeAPCallback);

    objectDiv.appendChild(additionalPropertiesDiv);
  }
  
//  if(!required)
//    objectDiv.querySelectorAll(".disableable:not(.toggler)").forEach(e => {
//      e.disabled = true;
//    });

  return objectDiv;
}

function addAdditionalProperty(object, checking, id, required, additionalPropertiesDiv, removeAPCallback) {
  let suffix;
//debugger;
       if (!additionalPropertiesDiv.querySelector(":scope > .additional-property"))
         suffix = 1;
       else
         suffix = parseInt(
             additionalPropertiesDiv.lastChild.id.split("__").pop()
         ) + 1;

  const apId = id + "__additional-properties__" + suffix;
  const apDiv = document.createElement("div");
  apDiv.id = apId;
  apDiv.classList.add("additional-property");
  propertyKeyInput = createTextInput(apId + "__key", "text", null, null, required);
  propertyKeyInput.classList.add("additional-property-key");
  propertyValueDiv = create(object.additionalProperties, checking, apId + "__value", null, required, true);

  const removeAPButton = createButton("button", "Remove Additional Property", removeAPCallback);
  apDiv.appendChild(removeAPButton);
  apDiv.appendChild(propertyKeyInput);
  apDiv.appendChild(propertyValueDiv);
  enable(propertyValueDiv);
  additionalPropertiesDiv.appendChild(apDiv);
}

function createArray(object, checking, id, datalistId, required) {
  const removeButtonCallback = function() {
    if (!object.minItems || object.minItems < this.parentNode.parentNode.querySelectorAll(".array-item").length)
      this.parentNode.remove();
  };

  const arrayDiv = initElement(id, "array", required);

  const addItemButton = createButton("button", "+", function() {
    if (!object.maxItems || object.maxItems > arrayDiv.querySelectorAll(".array-item").length)
      addItem(object.items, checking, id, datalistId, required, arrayDiv, removeButtonCallback);
  }, "add-button disableable");

  arrayDiv.appendChild(addItemButton);

  if(object.minItems)
    for(let i = 1; i <= object.minItems; i++)
      addItem(object.items, checking, id, datalistId, required, arrayDiv, removeButtonCallback);

  checking.check = function() {
    let valid = true;
    const valueSet = new Set();

    arrayDiv.querySelectorAll(":scope > .array-item").forEach(i => {
      const v = i.querySelector(":scope > input").value;
      valueSet.add(v);
      valid = valid && this.checkingFunction(v);
    });

    if (object.uniqueItems === true)
      valid = valid && (arrayDiv.querySelectorAll(":scope > .array-item").length === valueSet.size);

    return valid;
  }

//  const arrayDiv = document.createElement("div");
  arrayDiv.id = id;
  arrayDiv.classList.add("array");
//  arrayDiv.appendChild(arrayDiv);
  
//  if(!required)
//    arrayDiv.querySelectorAll(".disableable:not(.toggler)").forEach(e => {
//      e.disabled = true;
//    });

  return arrayDiv;
}

function addItem(object, checking, id, datalistId, required, arrayDiv, removeButtonCallback) {
  let suffix;

  if (!arrayDiv.querySelector(":scope > .array-item"))
    suffix = 1;
  else {
    const itemsNodeList = arrayDiv.querySelectorAll(":scope > .array-item");
    const inputId = itemsNodeList.item(itemsNodeList.length - 1).querySelector("input").id;
    suffix = parseInt(inputId.substring(id.length + 2, inputId.length)) + 1;
  }

  const itemId = id + "__" + suffix;
  let itemDiv;
  
  if (object)
    itemDiv = create(object, checking, itemId, datalistId, required, true);
  else
    itemDiv = create({type: "string"}, checking, itemId, datalistId, required, true);

  itemDiv.classList.add("array-item");
  const removeItemButton = createButton("button", "-", removeButtonCallback);
  itemDiv.appendChild(removeItemButton);
  enable(itemDiv);
  arrayDiv.appendChild(itemDiv);
}

function createString(object, checking, id, inputType = "text", datalistId = null, pattern = null, required = false, aioop = false) {
  const stringDiv = createTextInputWithLabel(id, "string", inputType, datalistId, pattern, required, aioop);

  stringDiv.check = function() {
    let valid = true;
    const v = stringDiv.lastChild.value;

    if (object.pattern && !v.match(new RegExp(object.pattern)))
      valid = false;

    if (object.minLength)
      valid = valid && (v.length >= object.minLength)

    if (object.maxLength)
      valid = valid && (v.length <= object.maxLength)

    return valid;
  }

  return stringDiv;
}

function createInteger(object, checking, id, inputType = "text", datalistId = null, required = false, aioop = false) {
  const integerDiv = createTextInputWithLabel(id, "integer", inputType, datalistId, "\\d+", required, aioop);

  integerDiv.check = function() {
    let valid;
    const v = parseInt(integerDiv.lastChild.value);
    
    if(integerDiv.lastChild.value.match(new RegExp("\\d+")))
      valid = true;
    else
      valid = false;

    if (object.exclusiveMinimum)
      valid = valid && (v > object.exclusiveMinimum)

    if (object.exclusiveMaximum)
      valid = valid && (v < object.exclusiveMaximum)

    if (object.minimum)
      valid = valid && (v >= object.minimum)

    if (object.maximum)
      valid = valid && (v <= object.maximum)

    if (object.multipleOf)
      valid = valid && (v % parseFloat(object.multipleOf) === 0)

    return valid;
  }

  return integerDiv;
}

function createTextInputWithLabel(id, type, inputType, datalistId, pattern, required, aioop) {
  const inputElement = createTextInput(id, inputType, datalistId, pattern);
  const labelElement = createLabel(id, beautifyId(id));

  const divElement = initElement(id, type, required, aioop);
  divElement.appendChild(labelElement);
  divElement.appendChild(inputElement);
  return divElement;
}

function beautifyId(id) {
  // TODO
  return id;
}

function htmlizeRegex(pattern) {
  // TODO
  return pattern;
}

function createOneOfButton(i) {
  const callback = function() {
    this.disabled = true;
    this.dataset.state = "enabled";

    this.parentNode.childNodes.forEach(e => {
      if(e !== this) {
        e.disabled = false;
        e.dataset.state = "disabled";
      }
    });

    this.parentNode.nextElementSibling.childNodes.forEach((e, j) => {
      if(i === j)
        enable(e);
      else
        disable(e);
    });
  };

  return createButton("button", "Option " + i, callback, "one-of-toggler disableable");
}

function createToggleButton() {
  const callback = function() {
//    debugger;
    if(this.dataset.state === "enabled") {
      this.dataset.state = "disabled";
      disable(this.parentNode);
    } else if(this.dataset.state === "disabled") {
      this.dataset.state = "enabled";
      enable(this.parentNode);
    }

//    this.parentNode.querySelectorAll(".disableable").forEach(e => {
//      if(e !== this)
//        e.disabled = disable;
//
//      if(e.classList.contains("toggler"))
//        if(!disable)
//          e.dataset.state = "enabled";
//        else
//          e.dataset.state = "disabled";
//    });
  };
  return createButton("button", "Toggle enabled", callback, "toggler disableable");
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

function createDatalist(datalistId, datalist) {
  const datalistElement = document.createElement("datalist");
  datalistElement.id = datalistId;

  // TODO: Support for complex objects in datalist
  datalist.forEach(datum => {
    const optionElement = document.createElement("option");
    optionElement.value = datum;
    datalistElement.appendChild(optionElement);
  });

  return datalistElement;
}

function createLabel(labeledId, text) {
  const labelElement = document.createElement("label");
  labelElement.htmlFor = labeledId;
  labelElement.innerHTML = text;

//  if (required) {
//    const requiredAbbr = document.createElement("abbr");
//    requiredAbbr.title = "required";
//    requiredAbbr.innerHTML = "*";
//    labelElement.appendChild(requiredAbbr);
//  }

  return labelElement;
}

function createTextInput(id, inputType, datalistId = null, pattern = null, required = true) {
  let inputElement;

  switch(inputType) {
    case "const":
      inputElement = document.createElement("input");
      inputElement.type = "text";
      break;
    default:
    case "text":
      inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.classList.add("disableable");
      break;
    case "textarea":
      inputElement = document.createElement("textarea");
      inputElement.classList.add("disableable");
      break;
  };

  inputElement.id = id;
  inputElement.name = id;

  if (datalistId)
    inputElement.setAttribute("list", datalistId);

  if (pattern)
    inputElement.pattern = pattern;

  inputElement.required = required;
  return inputElement;
}

let merge = (...arguments) => {

  // Variables
  let target = {};
  let i = 0;

  // Merge the object into the target object
  let merger = (obj) => {
   for (let prop in obj) {
       if (obj.hasOwnProperty(prop)) {
           if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
               // If we're doing a deep merge and the property is an object
               target[prop] = merge(target[prop], obj[prop]);
           } else {
               // Otherwise, do a regular merge
               target[prop] = obj[prop];
           }
       }
   }
  };

  //Loop through each object and conduct a merge
  for (; i < arguments.length; i++) {
   merger(arguments[i]);
  }

  return target;
};

function sendForm() {
  console.log(this);
  this.querySelectorAll("input:not([disabled])").forEach(e => {
    if(!e.classList.contains("additional-property-key") && e.type !== "submit")
      console.log(e.parentNode.check());
  });

  // TODO: Implement form sending
  console.log("Sending form not implemented yet");
  return false;
};