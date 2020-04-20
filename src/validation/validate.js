/**
 * Exports a function to validate a property or form based on a given schema.
 * @module validate
 */

import { isString, isObject, isEmptyString } from "./utils";
import { NO_ERRORS, ERROR_MESSAGES as Errors } from "./constants";

/**
 * The validation configurations.
 * @typedef {Object} ValidationOptions
 * @property {boolean} [includeLabel=false] - Configuration for pre-appending label to the error messages.
 * @property {boolean} [includeRules=false] - Configuration for returning errors as an object with each key
 *                                           the name of the validator and value the associating error message.
 * @property {boolean} [abortEarly=false] - Configuration indicating whether
 *                                          to stop validation at the first invalid rule.
 */

/**
 *  The response from validating a form.
 * @typedef {Object} FormValidationResponse
 * @property {boolean} isValid - Property detailing whether the form validated successfully.
 * @property {Object<string,string[]>} errors - The errors present in the form.
 */

/**
 * The response from validating a single property.
 * @typedef {Object} PropertyValidationResponse
 * @property {boolean} isValid - Property detailing whether the value was validated successfully.
 * @property {string[]} errors - The errors present in the property.
 * @property {Object} [failedRules] - The names of all the failed validation rules.
 */

/************************************
 *        Symbolic Constants
 ************************************/
const DEFAULT_OPTIONS = {
  abortEarly: false,
  includeRules: false,
  includeLabel: false,
};

/**
 * Validate a form or string value based on corresponding schema.
 * @param {(string|Object<string,string>)} value - The string or form to validate.
 * @param {Object<string,Function> | Function} schema - The corresponding schema.
 * @param {ValidationOptions} [options] - The validation configurations.
 * @returns {( FormValidationResponse | PropertyValidationResponse)} Object with validation results.
 * @throws {TypeError} When given value is neither an object (form) nor a string (single property).
 */
export default function validate(value, schema, options = DEFAULT_OPTIONS) {
  if (isString(value)) {
    return validateProperty(value, validateSchema(schema), options);
  }

  if (isObject(value)) {
    return validateForm(value, schema, options);
  }

  // Given value is neither a single value nor a form
  throw new TypeError(Errors.INVALID_VALUE_TYPE);
}

/************************************
 *         Helper Functions
 ************************************/

/**
 * Validate entire form based on given schema.
 * @param {Object<string, string>} form - The form to validate.
 * @param {Object<string, Function>} formSchema - The corresponding schema.
 * @param {ValidationOptions} options - The validation configurations.
 * @returns {...FormValidationResponse}
 */
function validateForm(form, formSchema, options) {
  let formIsValid = true;

  const formErrors = {};
  const formFailedRules = {};

  // Check that schema matches form and validate
  let schema, errors, isValid, failedRules;
  Object.keys(form).forEach((property) => {
    // Throw error if property does not have corresponding schema
    schema = formSchema[property];
    if (!schema) {
      throw new Error(Errors.FORM_SCHEMA_MISMATCH);
    }

    // Check if current schema has corresponding property and
    // set current schema to test for matching value
    schema = validateSchema(schema);
    if (schema.matchingProperty) {
      schema = getMatchingSchema(schema, form);
    }
    // Validate properties and set errors
    ({ isValid, errors, failedRules } = validateProperty(
      form[property],
      schema,
      options
    ));

    if (!isValid) {
      formIsValid = false;
      formErrors[property] = [...errors];
      formFailedRules[property] = { ...failedRules };
    }
  });

  return !options.includeRules
    ? { isValid: formIsValid, errors: { ...formErrors } }
    : {
        isValid: formIsValid,
        errors: { ...formErrors },
        failedRules: { ...formFailedRules },
      };
}

/**
 * Generate special schema for property that matches to another form property.
 * @param {object} schema - The schema for the current property.
 * @param {Object<string, string>} form - The form to validate.
 * @returns {Object} New schema with the matching property's value as a rule.
 * @throws Error when no matching property is found.
 */
function getMatchingSchema(schema, form) {
  const { matchingProperty } = schema;
  const matchingValue = form[matchingProperty];

  if (!isString(matchingValue)) {
    throw new Error(
      Errors.NO_MATCHING_PROPERTY.replace("PROPERTY", matchingProperty)
    );
  }

  schema.rules[0] = schema.rules[0](matchingValue);
  return { ...schema };
}

/**
 * Validate property value based on given schema.
 * @param {string} value - The value to be validated.
 * @param {object} schema - The corresponding schema.
 * @param {ValidationOptions} options - The validation configurations.
 * @returns {PropertyValidationResponse} An object with validation status and error messages.
 */
function validateProperty(value, schema, options) {
  const errors = [];
  const failedRules = {};
  const { includeRules } = options;

  // Empty non-required properties are fine.
  if (!schema.required && isEmptyString(value)) {
    return !includeRules
      ? { isValid: true, errors }
      : { isValid: true, errors, failedRules };
  }

  // Required property and empty value
  if (schema.required && isEmptyString(value)) {
    errors.push(schema.required);
    failedRules.required = true;
  }

  testRules(value, schema, errors, failedRules, options);
  return !includeRules
    ? { isValid: errors.length === NO_ERRORS, errors }
    : { isValid: errors.length === NO_ERRORS, errors, failedRules };
}

/**
 * Check whether schema is valid.
 * @param {object} schema - The schema to validate.
 * @returns {object} The validated schema.
 * @throws Error when schema is invalid.
 * @throws {TypeError} When schema type is invalid
 */
function validateSchema(schema) {
  try {
    schema = schema.validateSchema();
  } catch (error) {
    if (error.name === TypeError.name) {
      error.message = Errors.INVALID_SCHEMA_TYPE;
    }
    throw error;
  }
  return schema;
}

/**
 * Test value against all the validation rules in the schema.
 * @param {string} value - The value to be validated.
 * @param {object} schema - The schema with the rules to be validated against.
 * @param {string[]} errors - The error messages for failed rules.
 * @param {object} failedRules - The names of all the failed rules.
 * @param {ValidationOptions} options - The validation configurations.
 * @returns {void} Nothing.
 */
function testRules(value, schema, errors, failedRules, options) {
  const { rules, label } = schema;
  const { abortEarly, includeLabel } = options;

  // Loop through matching each validator
  let result;
  for (let index = 0; index < rules.length; index++) {
    result = rules[index](value); // Run the validator.

    if (result !== true) {
      errors.push(getErrorMessage(label, result, includeLabel));
      failedRules[rules[index].name] = true;

      if (abortEarly) break;
    }
  }
}

/**
 * Get the appropriate error message.
 * @param {string} label - The label to be pre-appended to the error message.
 * @param {string} errorMessage - The error message.
 * @param {boolean} includeLabel - Check determining whether the label should be included.
 * @returns {string} Error message with label pre-appended if includeLabel is true.
 */
function getErrorMessage(label, errorMessage, includeLabel) {
  return includeLabel && label ? `${label} ${errorMessage}` : errorMessage;
}
