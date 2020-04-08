/**
 * @file Schema for property validation
 * @author <a href="mailto:fabricevladimir@outlook.com">Fabrice V.</a>
 */

import * as Rules from "./rules";
import { SCHEMA, ERROR_MESSAGES as Errors } from "./constants";
import { validateType, isNumber, isString, isEmptyString } from "./utils";

/************************************
 *        Symbolic Constants
 ************************************/
const DEFAULT_RULES = {
  minimum: {
    value: SCHEMA.DEFAULT_MIN,
    ...Rules.getMinLengthRule(SCHEMA.DEFAULT_MIN),
  },
  maximum: {
    value: SCHEMA.DEFAULT_MAX,
    ...Rules.getMaxLengthRule(SCHEMA.DEFAULT_MAX),
  },
};

/************************************
 *        Class Declaration
 ************************************/

/** Creates a new Schema. */
export default class Schema {
  /**
   * The object detailing the validation rules to be tested for.
   * @private
   * @static
   * @type {object}
   */
  #schema = { rules: { ...DEFAULT_RULES } };

  /**
   * Set the minimum number of characters the property should contain.
   * @param {number} value - The minimum length.
   * @return {Schema} The current schema instance.
   * @throws {TypeError} when value is not a number.
   * @throws {RangeError} when value is negative.
   */
  min(value) {
    validateLength(value);

    this.#schema.rules.minimum = {
      value,
      ...Rules.getMinLengthRule(value),
    };
    return this;
  }

  /**
   * Get the minimum number of characters the property should contain.
   * @type {number}
   */
  get minimum() {
    return this.#schema.rules.minimum.value;
  }

  /**
   * Set the maximum number of characters the property should contain.
   * @param {number} value - The maximum length.
   * @return {Schema} The current schema instance.
   * @throws {TypeError} when value is not a number.
   * @throws {RangeError} when value is negative.
   */
  max(value) {
    validateLength(value);

    this.#schema.rules.maximum = {
      value,
      ...Rules.getMaxLengthRule(value),
    };
    return this;
  }

  /**
   * Get the maximum number of characters the property should contain.
   * @type {number}
   */
  get maximum() {
    return this.#schema.rules.maximum.value;
  }

  /**
   * Set property to contain at least one digit.
   * @return {Schema} The current schema instance.
   */
  hasDigit() {
    this.#schema.rules.digit = Rules.DIGIT;
    return this;
  }

  /**
   * Return whether property should contain at least one digit.
   * @readonly
   * @type {boolean}
   */
  get digit() {
    return this.#schema.rules.digit ? true : false;
  }

  /**
   * Set property to contain at least one special character.
   * @return {Schema} The current schema instance.
   */
  hasSymbol() {
    this.#schema.rules.symbol = Rules.SYMBOL;
    return this;
  }

  /**
   * Return whether property should contain at least
   * one special character.
   *
   * @readonly
   * @type {boolean}
   */
  get symbol() {
    return this.#schema.rules.symbol ? true : false;
  }

  /**
   * Set property to contain at least one uppercase character
   * @return {Schema} The current schema instance.
   */
  hasUppercase() {
    this.#schema.rules.uppercase = Rules.UPPERCASE;
    return this;
  }

  /**
   * Return whether property should contain at least
   * one uppercase character.
   *
   * @readonly
   * @type {boolean}
   */
  get uppercase() {
    return this.#schema.rules.uppercase ? true : false;
  }

  /**
   * Set property to contain at least one lowercase character
   * @return {Schema} The current schema instance.
   */
  hasLowercase() {
    this.#schema.rules.lowercase = Rules.LOWERCASE;
    return this;
  }

  /**
   * Return whether property should contain at least
   * one lowercase character.
   *
   * @readonly
   * @type {boolean}
   */
  get lowercase() {
    return this.#schema.rules.lowercase ? true : false;
  }

  /**
   * Set label to be pre-appended to the property's
   * validation error messages
   *
   * @param {string} name
   * @return {Schema} The current schema instance.
   */
  label(name) {
    validateStringInput(name, "Label");

    this.#schema.label = name;
    return this;
  }

  /**
   * Get property label.
   * @readonly
   * @type {string}
   */
  get alias() {
    return this.#schema.label;
  }

  /**
   * Set property to be validated as an email address.
   * @return {Schema} The current schema instance.
   */
  isEmail() {
    this.#schema.email = true;
    return this;
  }

  /**
   * Get whether property is an email.
   * @readonly
   * @type {boolean}
   */
  get email() {
    return this.#schema.email ? true : false;
  }

  /**
   * Set property to be validated.
   * @return {Schema} The current schema instance.
   */
  isRequired() {
    this.#schema.required = true;
    return this;
  }

  /**
   * Return whether property should be validated.
   * @readonly
   * @type {boolean}
   */
  get required() {
    return this.#schema.required ? true : false;
  }

  /**
   * Set property validation to match the value of given property name.
   * @param {string} name - The matching property name.
   * @return {Schema} The current schema instance.
   * @throws {TypeError} When the name is not a string.
   * @throws Throws an error the name is an empty string.
   */
  matches(name) {
    validateStringInput(name, "Matching property");
    this.#schema.matchingProperty = name;
    return this;
  }

  /**
   * Get the name of the matching property.
   * @readonly
   * @type {string}
   */
  get matchingProperty() {
    return this.#schema.matchingProperty;
  }

  /**
   * Must be called last to make sure schema is properly configured.
   * @see {@link validation.js} for further information.
   *
   * @returns {object} New object containing the schema rules.
   * @throws Will throw and error when minimum length is greater
   *         than maximum length or minimum or maximum length is
   *         less than the number of required characters.
   */
  validate() {
    const { email, label, rules, required, matchingProperty } = this.#schema;
    const { minimum, maximum } = rules;

    // Ignore everything else
    if (matchingProperty) {
      return { required, label, matchingProperty, rules: [] };
    }

    // Ignore everything else
    if (email) {
      return { required, label, rules: [Rules.EMAIL] };
    }

    // min greater than max
    if (minimum.value > maximum.value) {
      throw new Error(Errors.INVALID_MIN_OVER_MAX);
    }

    // Note that min and max are included by default
    const requiredChars =
      Object.keys(rules).length - Object.keys(DEFAULT_RULES).length;

    // more characters than min/max length
    if (maximum.value < requiredChars || minimum.value < requiredChars) {
      throw new Error(Errors.INVALID_MIN_MAX);
    }

    // values not needed anymore
    delete rules.minimum.value;
    delete rules.maximum.value;

    // Return rules as array
    return { ...this.#schema, rules: Object.values(rules) };
  }
}

/************************************
 *         Helper Functions
 ************************************/

/**
 * Validate minimum and maximum number of characters.
 * @param {number} value The value to be validated.
 * @returns {void} Nothing.
 * @throws {TypeError} When the given value is not a number.
 * @throws {RangeError} When the length is negative.
 */
function validateLength(value) {
  validateType(value, isNumber);

  // Validate range
  if (value < SCHEMA.DEFAULT_MIN) {
    throw new RangeError(Errors.INVALID_NUMBER);
  }
}

/**
 * Validate property names.
 * @param {string} value - The value to be validated.
 * @param {string} propertyName - The property name being validated.
 * @returns {void} Nothing.
 * @throws Throws an error when the given value is an empty string.
 * @throws {TypeError} When the given value is not a string.
 */
function validateStringInput(value, propertyName) {
  validateType(value, isString);

  // Empty validation
  if (isEmptyString(value)) {
    throw new Error(Errors.EMPTY_PROPERTY.replace("PROPERTY", propertyName));
  }
}
