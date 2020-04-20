const pattern = /[a-z]/;

/**
 * Return lowercase validator function.
 * @param {string} errorMessage - The error message to display when
 *                                the validation pattern fails to match.
 *
 * @return {Function} The validator function.
 */
export default function lowercase(errorMessage) {
  return (
    /**
     * Check if input includes a lowercase character.
     * @param {string} value - The value to be validated.
     * @return {(boolean | string)} True or an error message if validation failed.
     */
    function lowercase(value) {
      return pattern.test(value) || errorMessage;
    }
  );
}
