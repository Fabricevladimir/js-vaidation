const pattern = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/;

/**
 * Return email validator function.
 * @param {string} errorMessage - The error message to display when
 *                                the validation pattern fails to match.
 *
 * @return {Function} The validator function.
 */
export default function email(errorMessage) {
  return (
    /**
     * Check if input is a valid email address.
     * @param {string} email - The value to be validated.
     * @return {(boolean | string)} True or an error message if validation failed.
     */
    function (email) {
      return pattern.test(email) || errorMessage;
    }
  );
}
