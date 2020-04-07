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
    ...Rules.getMinLengthRule(SCHEMA.DEFAULT_MAX),
  },
};

const DEFAULT_SCHEMA = { rules: { ...DEFAULT_RULES } };

/************************************
 *        Class Declaration
 ************************************/
export default class Schema {
  #schema = { ...DEFAULT_SCHEMA };

  /**
   * Expect minimum length
   * @param {number} value minimum length
   */
  min(value) {
    validateSize(value);

    this.#schema.rules.minimum = { value, ...Rules.getMinLengthRule(value) };
    return this;
  }

  /**
   * Expect maximum length
   * @param {number} value maximum length
   */
  max(value) {
    validateSize(value);

    this.#schema.rules.maximum = { value, ...Rules.getMaxLengthRule(value) };
    return this;
  }

  /**
   * Expect at least one digit
   */
  hasDigit() {
    this.#schema.rules.digit = Rules.DIGIT;
    return this;
  }

  /**
   * Expect at least one special character
   */
  hasSymbol() {
    this.#schema.rules.symbol = Rules.SYMBOL;
    return this;
  }

  /**
   * Expect at least one uppercase character
   */
  hasUppercase() {
    this.#schema.rules.uppercase = Rules.UPPERCASE;
    return this;
  }

  /**
   * Expect at least one lowercase character
   */
  hasLowercase() {
    this.#schema.rules.lowercase = Rules.LOWERCASE;
    return this;
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

  /**
   * Specify whether property should be validated as an email
   */
  isEmail() {
    this.#schema.email = true;
    return this;
  }

  /**
   * Set property to be required
   */
  isRequired() {
    this.#schema.required = true;
    return this;
  }

  /**
   * Set property validation to match that of given property name
   * @param {*} propertyName matching property name
   */
  matches(propertyName) {
    validateStringInput(propertyName, Errors.EMPTY_MATCHING_PROPERTY);
    this.#schema.matchingProperty = propertyName;
    return this;
  }

  /**
   * Must be called last to make sure schema is properly configured
   * @returns {object} created schema
   */
  validate() {
    const { email, rules, required, matchingProperty } = this.#schema;
    const { minimum, maximum } = rules;

    // Ignore everything else
    if (matchingProperty) {
      return { required, matchingProperty, rules: [] };
    }

    // Ignore everything else
    if (email) {
      return { required, rules: [Rules.EMAIL] };
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

    // Value is not needed anymore
    delete rules.maximum.value;
    delete rules.minimum.value;

    return this.#schema;
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
