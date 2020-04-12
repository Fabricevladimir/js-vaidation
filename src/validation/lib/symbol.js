const pattern = /[!@#$%^&*(),.?":{}|<>]/;

/**
 * Return symbol validator function.
 * @param {string} errorMessage - The error message to display when
 *                                the validation pattern fails to match.
 *
 * @return {Function} The validator function.
 */
export default function symbol(errorMessage) {
  return (
    /**
     * Check if input includes a special character.
     * @param {string} value - The value to be validated.
     * @return {(boolean | string)} True or an error message if validation failed.
     */
    function (value) {
      return pattern.test(value) || errorMessage;
    }
  );
}
