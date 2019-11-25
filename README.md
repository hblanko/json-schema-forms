# json-schema-forms
A pure JavaScript tool that generates HTML forms from JSON Schemas.

This implementation accepts schemas following the [JSON Schema Draft 2019-09 specification](https://json-schema.org/).

Usage:

```js
document.body.appendChild(
  generate(jsonSchemaObject, "Form Name")
);
```

Base code is still under work, being several features not yet covered (but expected to be):
 - The 'anyOf' keyword
 - Some features from JSON Schema types, e.g. the 'contains' directive from the 'object' type
 - Reconstruction of form data into JSON (either client- or server-side)
 - Beautifying Layout and general bugfixing.
