const pattern = /[0-9]/;

/**
 * Return digit validator function.
 * @param {string} errorMessage - The error message to display when
 *                                the validation pattern fails to match.
 *
 * @return {Function} The validator function.
 */
export default function digit(errorMessage) {
  return (
    /**
     * Check if input includes a digit.
     * @param {string} value - The value to be validated.
     * @return {(boolean | string)} True or an error message if validation failed.
     */
    function digit(value) {
      return pattern.test(value) || errorMessage;
    }
  );
}
