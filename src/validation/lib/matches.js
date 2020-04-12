/**
 * Return function to take in matching property value.
 * @param {string} errorMessage - The error message to display when
 *                                the validation pattern fails to match.
 *
 * @return {Function} The function taking in the matching value.
 */
export default function matches(errorMessage) {
  return (
    /**
     * Return matching property validator.
     * @param {string} matchingValue - The matching property's value.
     * @return {Function} - The matching property validator.
     */
    function (matchingValue) {
      return (
        /**
         * Check if input matches the value of another property.
         * @param {string} value - The value to be validated.
         * @return {(boolean | string)} True or an error message if validation failed.
         */
        function (value) {
          return (
            new RegExp(`^${escape(matchingValue)}$`).test(value) || errorMessage
          );
        }
      );
    }
  );
}

/**
 * Escape a value in regex pattern.
 * @param {string} value - The value to be escaped.
 * @returns {string} The value with escape character.
 */
function escape(value) {
  return value.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
}
