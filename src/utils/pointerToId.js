/**
 * Builds a string with a format suitable for its use as an HTML `id` tag
 * attribute.
 *
 * @param {string} pointer A JSON Pointer-like string that provides unique
 * identification of the JSON Schema being represented by the form element.
 *
 * @returns {string} The formatted string suitable for `id` tag attributes.
 */
function pointerToId(pointer) {
  return `json-schema__${pointer.replace(/\//gi, '_')}`;
}

export default pointerToId;
