# json-schema-forms
A JavaScript tool that generates HTML forms from JSON Schemas.

This implementation accepts schemas following the [JSON Schema Draft 2019-09 specification](https://json-schema.org/), and provides [Bootstrap](https://getbootstrap.com/) support (4.4+) to organize and decorate the layout.

`json-schema-forms` makes use of the [JSON Schema $Ref Parser](https://github.com/APIDevTools/json-schema-ref-parser) in order to resolve and dereference the relevant JSON Schemas.

## Usage
[Yarn](https://yarnpkg.com/) is required in order to generate a bundled version of the script (using [Parcel](https://parceljs.org/)).

Simply download and install both the `json-schema-forms` and the required packages with the following commands:

```console
$ git clone https://github.com/hblanko/json-schema-forms.git
$ yarn setup
```

The `package.json` document comes prepared with two scripts:

- `dev`: Runs on development mode, initializing a live server that refreshes automatically on script changes.
- `build`: Generates the bundled script together with the other output files.

The options for each of these scripts can be adapted to your needs inside the `package.json` document.

Given so, you can change the `index.js` script to suit your needs and just run the following to produce the expected output:

```console
$ yarn <dev|build>
```

## Forthcoming

Base code is still under work, being several features not yet covered (but expected to be):
 - The 'allOf' keyword
 - A number of features from JSON Schema types, e.g. the 'contains' directive from the 'object' type
 - General bugfixing

This script was initially conceived to be used in the framework of [the Cookbase Project](https://github.com/hblanko/cookbase).
