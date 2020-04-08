import {
  NO_ERRORS,
  ERROR_MESSAGES as Errors,
  VALIDATION_ERROR_MESSAGES as Messages,
} from "./constants";
import { getMatchesRule } from "./rules";
import { isString, isObject, isEmptyString } from "./utils";

const DEFAULT_OPTIONS = { includeLabel: false, abortEarly: false };

/**
 * Validate a form or string value based on corresponding schema
 * @param {*} value string of form to validate
 * @param {Object} schema schema corresponding to value
 * @param {Object} options configuration options
 * @returns {{isValid: boolean, errors: string[]| Object.<string,string[]>}} object with validity and error messages
 */
export default function validate(value, schema, options = DEFAULT_OPTIONS) {
  if (isString(value)) {
    return validateProperty(value, validateSchema(schema), options);
  }

  if (isObject(value)) {
    return validateForm(value, schema, options);
  }

  throw new TypeError(Errors.INVALID_VALUE_TYPE);
}

function validateForm(form, formSchema, options) {
  let formIsValid = true;
  const formErrors = {};

  // Check that schema matches form and validate
  let schema, errors, isValid;
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
    ({ isValid, errors } = validateProperty(form[property], schema, options));
    if (!isValid) {
      formIsValid = false;
      formErrors[property] = [...errors];
    }
  });

  return { isValid: formIsValid, errors: { ...formErrors } };
}

/**
 * Return schema for matching properties
 * @param {*} schema
 * @param {*} form
 * @returns {{required: boolean, rules: [{pattern: RegExp, error:string}]}} new schema
 * @throws Error when no matching property is found
 */
function getMatchingSchema(schema, form) {
  const { matchingProperty } = schema;
  const matchingValue = form[matchingProperty];

  if (!isString(matchingValue)) {
    throw new Error(
      Errors.NO_MATCHING_PROPERTY.replace("PROPERTY", matchingProperty)
    );
  }

  return {
    ...schema,
    rules: [getMatchesRule(matchingValue, matchingProperty)],
  };
}

/**
 * Validate property value
 * @param {string} value value to be validated
 * @param {object} schema rules to be validated against
 * @param {object} options configurations
 * @returns {{isValid: boolean, errors: string[]}} object with validation status and error messages
 */
function validateProperty(value, schema, options) {
  const errors = [];
  if (!schema.required) {
    return { isValid: true, errors };
  }

  // Return immediately if empty
  if (isEmptyString(value.trim())) {
    errors.push(Messages.REQUIRED);
    return { isValid: false, errors };
  }

  testRules(value, schema, errors, options);
  return { isValid: errors.length === NO_ERRORS, errors };
}

/**
 * Check whether schema is an empty object
 * @param {object} schema rules to be validated against
 * @throws Error when schema is invalid
 * @throws {TypeError} when schema type is invalid
 */
function validateSchema(schema) {
  try {
    schema = schema.validate();
  } catch (error) {
    if (error.name === TypeError.name) {
      error.message = Errors.INVALID_SCHEMA_TYPE;
    }
    throw error;
  }
  return schema;
}

/**
 * Run through all the validation rules
 * @param {string} value value to be validated
 * @param {object} schema rules to be validated against
 * @param {string[]} errors error messages for failed rules
 * @param {object} options configurations
 * @returns {void}
 */
function testRules(value, schema, errors, options) {
  const { rules, label } = schema;
  const { abortEarly, includeLabel } = options;

  // Loop through testing each rule
  let pattern, error;
  for (let index = 0; index < rules.length; index++) {
    ({ pattern, error } = rules[index]);

    // Add label if present and break if abortEarly set to true
    if (pattern.test(value) === false) {
      errors.push(getErrorMessage(label, error, includeLabel));

      if (abortEarly) break;
    }
  }
}

/**
 * Return label pre-appended to error message
 * @param {string} label
 * @param {string} errorMessage
 * @param {boolean} includeLabel
 * @returns {string} label appended to the error message
 */
function getErrorMessage(label, errorMessage, includeLabel) {
  return includeLabel && label ? `${label} ${errorMessage}` : errorMessage;
}
