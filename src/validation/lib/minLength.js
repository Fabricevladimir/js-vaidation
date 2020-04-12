/**
 * Return minimum length validator function.
 * @param {number} length - The minimum number of characters.
 * @param {string} errorMessage - The error message to display when
 *                                the validation pattern fails to match.
 *
 * @return {Function} The validator function.
 */
export default function minLength(length, errorMessage) {
  return (
    /**
     * Check if input is of the specified minimum length.
     * @param {string} value - The value to be validated.
     * @return {(boolean | string)} True or an error message if validation failed.
     */
    function (value) {
      return new RegExp(`^.{${length},}$`).test(value) || errorMessage;
    }
  );
}
