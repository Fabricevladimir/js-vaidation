/** @module schema */

import * as Validators from "./lib";
import {
  ERROR_MESSAGES as Errors,
  VALIDATION_ERROR_MESSAGES as Messages,
} from "./constants";
import { validateType, isNumber, isString, isEmptyString } from "./utils";

/************************************
 *        Class Declaration
 ************************************/

/**
 * Creates a new Schema
 *
 * @example
 * const schema = new Schema();
 */
export default class Schema {
  /**
   * The object detailing the validation rules to be tested for.
   * @private
   * @type {object}
   */
  #schema = { rules: {} };

  /**
   * Set the minimum number of characters the property should contain.
   * @param {number} length - The minimum length.
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   * @throws {TypeError} when value is not a number.
   * @throws {RangeError} when value is negative.
   *
   * @example
   * const schema = new Schema().min(4);
   */
  min(length, customError) {
    validateLength(length);

    this.#schema.minimum = length;
    this.#schema.rules.minimum = Validators.minLength(
      length,
      customError || Messages.MIN_LENGTH.replace("VALUE", `${length}`)
    );

    return this;
  }

  /**
   * Set the maximum number of characters the property should contain.
   * @param {number} length - The maximum length.
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   * @throws {TypeError} when value is not a number.
   * @throws {RangeError} when value is negative.
   *
   * @example
   * const schema = new Schema().max(4);
   */
  max(length, customError) {
    validateLength(length);

    this.#schema.maximum = length;
    this.#schema.rules.maximum = Validators.maxLength(
      length,
      customError || Messages.MAX_LENGTH.replace("VALUE", `${length}`)
    );

    return this;
  }

  /**
   * Set property to contain at least one digit.
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   *
   * @example
   * const schema = new Schema().hasDigit();
   */
  hasDigit(customError) {
    this.#schema.rules.digit = Validators.digit(customError || Messages.DIGIT);
    return this;
  }

  /**
   * Set property to contain at least one special character.
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   *
   * @example
   * const schema = new Schema().hasSymbol();
   */
  hasSymbol(customError) {
    this.#schema.rules.symbol = Validators.symbol(
      customError || Messages.SYMBOL
    );
    return this;
  }

  /**
   * Set property to contain at least one uppercase character
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   *
   * @example
   * const schema = new Schema().hasUppercase();
   */
  hasUppercase(customError) {
    this.#schema.rules.uppercase = Validators.uppercase(
      customError || Messages.UPPERCASE
    );
    return this;
  }

  /**
   * Set property to contain at least one lowercase character
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   *
   * @example
   * const schema = new Schema().hasLowercase();
   */
  hasLowercase(customError) {
    this.#schema.rules.lowercase = Validators.lowercase(
      customError || Messages.LOWERCASE
    );
    return this;
  }

  /**
   * Set custom pattern to be matched. Once set, this pattern is the only
   * rule that will be tested.
   *
   * @param {(string | RegExp)} regexPattern - The pattern to use for validation.
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   *
   * @example
   * const schemaWithRegex = new Schema().hasPattern(/abc/);
   * const schemaWithString = new Schema().hasPattern("abc");
   */
  hasPattern(regexPattern, customError) {
    this.#schema.rules.pattern = Validators.pattern(
      regexPattern,
      customError || Messages.PATTERN
    );
    return this;
  }

  /**
   * Set label to be pre-appended to the property's
   * validation error messages
   *
   * @param {string} name
   * @return {Schema} The current schema instance.
   *
   * @example
   * const schema = new Schema().label("abc");
   */
  label(name) {
    validateStringInput(name, "Label");

    this.#schema.label = name;
    return this;
  }

  /**
   * Set property to be validated as an email address.
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   *
   * @example
   * const schema = new Schema().isEmail();
   */
  isEmail(customError) {
    this.#schema.rules.email = Validators.email(customError || Messages.EMAIL);
    return this;
  }

  /**
   * Set property to be validated.
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   *
   * @example
   * const schema = new Schema().isRequired();
   */
  isRequired(customError) {
    this.#schema.required = customError || Messages.REQUIRED;
    return this;
  }

  /**
   * Set property validation to match the value of given property name.
   * @param {string} name - The matching property name.
   * @param {string} [customError] - Custom error message.
   * @return {Schema} The current schema instance.
   * @throws {TypeError} When the name is not a string.
   * @throws Throws an error the name is an empty string.
   *
   * @example
   * const schema = new Schema().matches("password");
   */
  matches(name, customError) {
    validateStringInput(name, "Matching property");

    this.#schema.matchingProperty = name;
    this.#schema.rules.matchingProperty = Validators.matches(
      customError || Messages.MATCHING.replace("PROPERTY", name)
    );
    return this;
  }

  get matchingProperty() {
    return this.#schema.matchingProperty;
  }

  validate() {
    return this.#schema;
  }
  /**
   * Determines whether schema is configured properly and is called
   * automatically by the validate function.
   * @see {@link validation.js} for further information.
   *
   * @returns {object} New object containing the schema rules.
   * @throws When minimum length is greater than maximum length
   * @throws When minimum or maximum length is less than the number
   *         of required characters.
   */
  validateSchema() {
    const {
      label,
      rules,
      maximum,
      minimum,
      required,
      matchingProperty,
    } = this.#schema;

    if (matchingProperty) {
      return {
        label,
        required,
        matchingProperty,
        rules: [rules.matchingProperty],
      };
    }

    if (rules.pattern) {
      return { label, required, rules: [rules.pattern] };
    }

    if (rules.email) {
      return { label, required, rules: [rules.email] };
    }

    if (minimum > maximum) {
      throw new Error(Errors.INVALID_MIN_OVER_MAX);
    }

    /* Explicitly set minimum length is less than the minimum number of characters
     * required to successfully validate. For ex: minimum = 1, yet lowercase and uppercase
     * are also expected. This produces a conflict because for lower and upper to be valid,
     * there has to be at least 2 characters--not the 1 set by the minimum rule.
     */
    const requiredChars = getMinimumRequiredCharacters(rules);
    if (minimum < requiredChars || maximum < requiredChars) {
      throw new Error(Errors.INVALID_MIN_MAX);
    }

    // Remove min and max properties because they are no longer needed.
    delete this.#schema.minimum;
    delete this.#schema.maximum;
    const schema = { ...this.#schema, rules: Object.values(rules) };

    return schema;
  }
}

/************************************
 *         Helper Functions
 ************************************/

function getMinimumRequiredCharacters(rules) {
  let characters = Object.keys(rules).length;

  if (rules.minimum) characters--;
  if (rules.maximum) characters--;
  return characters;
}

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
  if (value < 0) {
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
