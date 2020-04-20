import { TYPES } from "../constants";

/**
 * Return regex pattern validator function.
 * @param {(string | RegExp)} regexPattern - The regular expression to match.
 * @param {string} errorMessage - The error message to display when
 *                                the validation pattern fails to match.
 *
 * @return {Function} The validator function.
 */
export default function pattern(regexPattern, errorMessage) {
  return (
    /**
     * Check if input matches given regex pattern.
     * @param {string} value - The value to be validated.
     * @return {(boolean | string)} True or an error message if validation failed.
     */
    function pattern(value) {
      const validationPattern =
        regexPattern.constructor.name === TYPES.REGEX
          ? regexPattern
          : new RegExp(regexPattern);
      return validationPattern.test(value) || errorMessage;
    }
  );
}
