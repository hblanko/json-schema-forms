/**
 * The main module implementing the form construction.
 *
 * @module JsonSchemaForms
 */
'use strict';

import FormElement from './form/formElement.js';
import defaultFormOptions from './form/defaultFormOptions.js';

import $RefParser from '@apidevtools/json-schema-ref-parser';
import jquery from 'jquery';

/**
 * Builds an HTML form from a given JSON Schema. The main function to be
 * interacted by users.
 *
 * It allows to provide specific options for the form construction, and a custom
 * callback function triggered on submission.
 *
 * @param {object} schema The JSON Schema to represent as an HTML form.
 * @param {Function} [submitCallback=() => {}] Callback function to be called
 * when the form triggers the `submit` DOM event.
 * @param {object} customFormOptions Form options overriding the default. See
 * {@link defaultFormOptions} for details.
 *
 * @returns {HTMLDivElement} A `<div>` element containing the HTML form.
 */
function build(schema, submitCallback = () => {}, customFormOptions = {}) {
  // Builds form options by merging the provided custom options with the
  // defaults.
  const formOptions = {
    ...defaultFormOptions,
    ...customFormOptions,
  };

  // Ensures jQuery is available if Bootstrap is required but failed loading.
  if (formOptions.bootstrap && !window.$) {
    console.warn('Bootstrap expected but JQuery was not loaded.');
    window.$ = jquery;
  }

  const containerDiv = document.createElement('div');

  $RefParser.dereference(schema, (err, s) => {
    if (err) console.error(err);
    else {
      // Generates the form recursively.
      const rootFormElement = new FormElement(s, {
        formOptions,
      });

      // Creates the HTML structure containing the form.
      const formDiv = document.createElement('div');
      const form = formDiv.appendChild(document.createElement('form'));
      form.id = formOptions.formId;

      form.addEventListener('submit', (event) => {
        const valid = submitCallback(rootFormElement);

        if (valid === false) event.preventDefault();
      });

      const submitButton = form.appendChild(document.createElement('button'));
      submitButton.type = 'submit';
      submitButton.innerText = formOptions.submitButtonText;

      containerDiv.appendChild(rootFormElement.layout.root);
      containerDiv.appendChild(formDiv);

      if (formOptions.bootstrap) {
        containerDiv.classList.add('container-fluid', 'bg-light');
        formDiv.classList.add('pt-4');
        submitButton.classList.add('btn', 'btn-primary');
      }
    }
  });

  return containerDiv;
}

export default { build };
