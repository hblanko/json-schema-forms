# json-schema-forms
A pure JavaScript tool that generates HTML forms from JSON Schemas.

This implementation accepts schemas following the [JSON Schema Draft 2019-09 specification](https://json-schema.org/), and provides Bootstrap support (4.4+) to organize and decorate the layout.

Usage:

```js
const serviceUrl = "http://www.example.com/your/receiver/web/api";

document.body.appendChild(
  generate(jsonSchemaObject, "Form Name")
);
```

Base code is still under work, being several features not yet covered (but expected to be):
 - The 'allOf' keyword
 - A number of features from JSON Schema types, e.g. the 'contains' directive from the 'object' type
 - General bugfixing

This script was initially conceived to be used in the framework of [the Cookbase Project](https://github.com/hblanko/cookbase).
