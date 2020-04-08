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
export default class Schema {
  #schema = { rules: { ...DEFAULT_RULES } };

  /**
   * Expect minimum length
   * @param {number} value minimum length
   */
  min(value) {
    validateSize(value);

    this.#schema.rules.minimum = {
      value,
      ...Rules.getMinLengthRule(value),
    };
    return this;
  }

  get minimum() {
    return this.#schema.rules.minimum.value;
  }

  /**
   * Expect maximum length
   * @param {number} value maximum length
   */
  max(value) {
    validateSize(value);

    this.#schema.rules.maximum = {
      value,
      ...Rules.getMaxLengthRule(value),
    };
    return this;
  }

  get maximum() {
    return this.#schema.rules.maximum.value;
  }

  /**
   * Expect at least one digit
   */
  hasDigit() {
    this.#schema.rules.digit = Rules.DIGIT;
    return this;
  }

  get digit() {
    return this.#schema.rules.digit ? true : false;
  }

  /**
   * Expect at least one special character
   */
  hasSymbol() {
    this.#schema.rules.symbol = Rules.SYMBOL;
    return this;
  }

  get symbol() {
    return this.#schema.rules.symbol ? true : false;
  }

  /**
   * Expect at least one uppercase character
   */
  hasUppercase() {
    this.#schema.rules.uppercase = Rules.UPPERCASE;
    return this;
  }

  get uppercase() {
    return this.#schema.rules.uppercase ? true : false;
  }

  /**
   * Expect at least one lowercase character
   */
  hasLowercase() {
    this.#schema.rules.lowercase = Rules.LOWERCASE;
    return this;
  }

  get lowercase() {
    return this.#schema.rules.lowercase ? true : false;
  }

  /**
   * label to use for custom errors
   * @param {string} name
   */
  label(name) {
    validateStringInput(name, Errors.EMPTY_LABEL);

    this.#schema.label = name;
    return this;
  }

  get alias() {
    return this.#schema.label;
  }

  /**
   * Specify whether property should be validated as an email
   */
  isEmail() {
    this.#schema.email = true;
    return this;
  }

  get email() {
    return this.#schema.email ? true : false;
  }

  /**
   * Set property to be required
   */
  isRequired() {
    this.#schema.required = true;
    return this;
  }

  get required() {
    return this.#schema.required ? true : false;
  }

  /**
   * Set property validation to match that of given property name
   * @param {string} name matching property name
   */
  matches(name) {
    validateStringInput(name, Errors.EMPTY_MATCHING_PROPERTY);

    this.#schema.matchingProperty = name;

    return this;
  }

  /**
   * Accessor form matching property
   */
  get matchingProperty() {
    return this.#schema.matchingProperty;
  }

  /**
   * Must be called last to make sure schema is properly configured
   * @returns {object} created schema
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
    // delete rules.minimum.value;
    // delete rules.maximum.value;

    // Return rules as array
    return { ...this.#schema, rules: Object.values(rules) };
  }
}

/************************************
 *         Helper Functions
 ************************************/

function validateSize(value) {
  validateType(value, isNumber);

  // Validate range
  if (value < SCHEMA.DEFAULT_MIN) {
    throw new RangeError(Errors.INVALID_NUMBER);
  }
}

function validateStringInput(value, message) {
  validateType(value, isString);

  // Empty validation
  if (isEmptyString(value)) {
    throw new Error(message);
  }
}
