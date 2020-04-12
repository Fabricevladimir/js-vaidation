/**
 * Return maximum length validator function.
 * @param {number} length - The maximum number of characters.
 * @param {string} errorMessage - The error message to display when
 *                                the validation pattern fails to match.
 *
 * @return {Function} The validator function.
 */
export default function maxLength(length, errorMessage) {
  return (
    /**
     * Check if input is of the specified maximum length.
     * @param {string} value - The value to be validated.
     * @return {(boolean | string)} True or an error message if validation failed.
     */
    function (value) {
      return new RegExp(`^.{0,${length}}$`).test(value) || errorMessage;
    }
  );
}
