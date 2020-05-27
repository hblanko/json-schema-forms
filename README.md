# JsonSchemaForms

A JavaScript tool that generates HTML forms from JSON Schemas.

This implementation accepts schemas following the [JSON Schema Draft 2019-09 specification](https://json-schema.org/), and provides [Bootstrap](https://getbootstrap.com/) (4.5+) and [Font Awesome](https://fontawesome.com/) (5.13+) to organize and decorate the layout. While these libraries are not required, they are highly recommended to get the form properly rendered by the browser.

JsonSchemaForms makes use of the [JSON Schema \$Ref Parser](https://github.com/APIDevTools/json-schema-ref-parser) in order to resolve and dereference the schemas to be processed.

## Usage

The JsonSchemaForms module provides a `build()` function that performs the whole process of analyzing a JSON Schema and generating the DOM and internal representation of the form. Have a look at the [`JsonSchemaForms.build()` API](docs/module-JsonSchemaForms.html) for usage details.

### Through CDN

The quickly and easy way to make JsonSchemaForms available to your scripts, by adding a few CDN links to your HTML code.

JsonSchemaForms provides a script and style sheet that can be linked adding the following tags:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/json-schema-forms@latest/css/json-schema-forms.min.css" />
```

```html
<script src="https://cdn.jsdelivr.net/npm/json-schema-forms@latest/dist/json-schema-forms.min.js"></script>
```

On top of that, as mentioned before, Bootstrap and Font Awesome allow for a nice-looking result, so their CDN links are recommended to be included, too.

Hence, the full picture of a barebone `example.html` using JsonSchemaForms CDN ends up looking like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <!-- Bootstrap-related style -->
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous" />
    <!-- JsonSchemaForms style sheet -->
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/json-schema-forms@latest/css/json-schema-forms.min.css" />
  </head>

  <body>
    <!-- Bootstrap and Font Awesome scripts -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js" integrity="sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI" crossorigin="anonymous"></script>
    <script src="https://kit.fontawesome.com/64968f57be.js" crossorigin="anonymous"></script>
    <!-- JsonSchemaForms script -->
    <script src="https://cdn.jsdelivr.net/npm/json-schema-forms@latest/dist/json-schema-forms.min.js"></script>
    <!-- Your script -->
    <script src="./example.js"></script>

    <!-- Some containers to use by your script -->
    <div id="form-container"></div>
    <pre id="json-result"></pre>
  </body>
</html>
```

Now, let us define our basic `example.js` script.

```javascript
// You've got two options in order to plug your JSON Schema:
//   1. Provide a URL to a JSON Schema.
//   2. Directly assign an object following the JSON Schema format.

// const schema = 'http://landarltracker.com/schemas/test.json';
const schema = {
  title: 'The Root Form Element',
  description: 'Easy, right?',
  type: 'string',
};

// Also, you can define the form behavior on submission, e.g.:
const submitCallback = (rootFormElement) => {
  // Show the resulting JSON instance in your page.
  document.getElementById('json-result').innerText = JSON.stringify(
    rootFormElement.getInstance(),
    null,
    2
  );
  // (For testing purposes, return false to prevent automatic redirect.)
  return false;
};

// Finally, get your form...
const jsonSchemaForm = JsonSchemaForms.build(schema, submitCallback);

// ... and attach it somewhere to your page.
window.addEventListener('load', () => {
  document.getElementById('form-container').appendChild(jsonSchemaForm);
});
```

This example works directly out of the box. Feel free to copy, paste, and play around with it!

### Custom bundle

If you prefer to import it into your own project, use your favorite package manager to install it:

```console
yarn add json-schema-forms
```

or

```console
npm i json-schema-forms
```

And just make it available by including at the top of your script:

```javascript
import JsonSchemaForms from 'json-schema-forms';
```

Then, you can use it as shown in `example.js` through the `build()` function
(check [the API docs](docs/module-JsonSchemaForms.html) for detailed information).

## What's to come?

Base code is still under work, being several features not yet covered (but expected to be):

- Conditional in-place applicators.
- Some child applicators (e.g. `patternProperties`) and validation keywords.
- Aggregation logic yet to be implemented for several keywords.

_JsonSchemaForms was initially conceived as a basis for a specialized version to be used in the framework of [the Cookbase Project](https://github.com/hblanko/cookbase)._
