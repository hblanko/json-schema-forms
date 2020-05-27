/**
 * The default options used to build the form.
 *
 * @enum
 */
const defaultFormOptions = {
  formId: 'json-schema-form',
  bootstrap: '4.5',
  fontAwesome: '5.13.0',
  maxEnumTabs: 5,
  maxSelectSize: 6,
  booleanTranslateFunction: (b) => (b ? 'Yes' : 'No'),
  arraySubstitute: 'List',
  objectSubstitute: 'Group',
  submitButtonText: 'Submit',
  initTogglersOff: false,
  arrayItemTitle: 'Item',
  adHocOptions: {
    todo: 'To-do',
  },
};

export default defaultFormOptions;
