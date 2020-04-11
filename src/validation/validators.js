/**
 * @file Validation rules, each with its specific pattern and custom error.
 * @module rules
 */

import {
  TYPES,
  REGEX_PATTERNS as Patterns,
  VALIDATION_ERROR_MESSAGES as Messages,
} from "./constants";

export function email(customError) {
  return function (email) {
    return Patterns.email.test(email) ? true : customError || Messages.EMAIL;
  };
}

export function digit(customError) {
  return function (value) {
    return Patterns.digit.test(value) ? true : customError || Messages.DIGIT;
  };
}

export function symbol(customError) {
  return function (value) {
    return Patterns.symbol.test(value) ? true : customError || Messages.SYMBOL;
  };
}

export function lowercase(customError) {
  return function (value) {
    return Patterns.lowercase.test(value)
      ? true
      : customError || Messages.LOWERCASE;
  };
}

export function uppercase(customError) {
  return function (value) {
    return Patterns.uppercase.test(value)
      ? true
      : customError || Messages.UPPERCASE;
  };
}

export const required = Messages.REQUIRED;

export function matches(matchingProperty, customError) {
  return function (matchingValue) {
    return function (value) {
      return new RegExp(`^${escape(matchingValue)}$`).test(value)
        ? true
        : customError ||
            Messages.MATCHING.replace("PROPERTY", matchingProperty);
    };
  };
}

export function pattern(regexPattern, customError) {
  return function (value) {
    const pattern =
      regexPattern.constructor.name === TYPES.REGEX
        ? regexPattern
        : new RegExp(regexPattern);

    return pattern.test(value) ? true : customError || Messages.PATTERN;
  };
}

export function minLength(length, customError) {
  return function (value) {
    return new RegExp(`^.{${length},}$`).test(value)
      ? true
      : customError || Messages.MIN_LENGTH.replace("VALUE", `${length}`);
  };
}

export function maxLength(length, customError) {
  return function (value) {
    return new RegExp(`^.{0,${length}}$`).test(value)
      ? true
      : customError || Messages.MAX_LENGTH.replace("VALUE", `${length}`);
  };
}

/**
 * Escape a value in regex pattern.
 * @param {string} value - The value to be escaped.
 * @returns {string} The value with escape character.
 */
function escape(value) {
  return value.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
}
