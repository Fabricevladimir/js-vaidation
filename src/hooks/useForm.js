import { useState } from "react";

import { validate } from "../validation";
import { EMPTY_VALUE } from "../validation/constants";

/**
 * Hook to handle underlying form functionality such as setting input changes,
 * errors, form and property validation and form submission
 * @param {!Object} schema schema of whole form
 * @param {?Object} initialFormState object with properties corresponding to form elements
 */
export default function useForm(schema, initialFormState = null) {
  /************************************
   * State
   ************************************/

  const [state, setState] = useState(init(schema, initialFormState));

  /************************************
   * Helper Functions
   ************************************/

  /**
   * Handles validating form and calling submitCallback
   * @param {Event} event form submit event
   * @callback submitForm async function that does actual submission
   */
  async function handleSubmit(submitForm, event = null) {
    if (event) event.preventDefault();

    // Validate and return errors
    const { isValid, errors: validationErrors } = validate(state.form, schema);
    if (!isValid) {
      setState({ ...state, errors: { ...validationErrors } });
      return;
    }

    try {
      submitForm();
    } catch (error) {
      // Note that the state will NOT be set if the  error is
      // caught inside the callback (submitForm) and not re-thrown
      setState({ ...state, submitError: error.message });
    }
  }

  /**
   * Clear form of values and errors
   */
  function handleReset() {
    setState(init(schema, initialFormState));
  }

  /**
   * Sets the appropriate state and errors. Validates the property
   * and allows user to run further validation
   * @param {Event} event onChange event
   */
  function handleInputChange(event) {
    const { form } = state;
    const { value, name } = event.target;

    // Ah, the good old days!
    setState({
      ...state,
      form: { ...form, [name]: value },
      errors: { ...validateProperty(name, value) },
    });
  }

  /**
   * Validate element or corresponding elements
   * @param {string} name property name
   * @param {string} value property value
   */
  function validateProperty(name, value) {
    const { errors, form } = state;
    let allErrors = { ...errors };
    const matchingProperty = getMatchingProperty(name, schema);

    // No matching property, just validate this one property
    if (!matchingProperty) {
      const { isValid, errors: propertyErrors } = validate(value, schema[name]);

      isValid
        ? delete allErrors[name]
        : (allErrors = { ...allErrors, [name]: propertyErrors });

      return { ...allErrors };
    }

    // Matching properties present. ex: password & confirm password
    const matchingValues = {
      [name]: value,
      [matchingProperty]: form[matchingProperty],
    };

    const matchingValuesSchema = {
      [name]: schema[name],
      [matchingProperty]: schema[matchingProperty],
    };

    // Clear previous errors on matching properties before
    // potentially re-setting them
    delete allErrors[name];
    delete allErrors[matchingProperty];

    const { errors: propertyErrors } = validate(
      matchingValues,
      matchingValuesSchema
    );

    return { ...allErrors, ...propertyErrors };
  }

  return {
    ...state,
    handleReset,
    handleSubmit,
    handleInputChange,
  };
}

/**
 * Derive state from given schema
 * @param {object} schema
 * @param {object} initialFormState
 */
function init(schema, initialFormState) {
  let form = initialFormState;

  if (!form) {
    form = {};
    for (const property in schema) {
      if (schema.hasOwnProperty(property)) {
        form[property] = EMPTY_VALUE;
      }
    }
  }
  return { form, errors: {}, submitError: EMPTY_VALUE };
}

/**
 * Find the corresponding element that matches the
 * current element being validated
 * @param {string} name element being validated
 * @param {object} schema schema of entire form
 */
function getMatchingProperty(name, schema) {
  // Return the matching property if present on current element's schema
  const { matchingProperty } = schema[name];
  if (matchingProperty) return matchingProperty;

  for (const property in schema) {
    // Don't bother comparing if it's the current property's schema
    if (property === name) continue;

    // Find and return the matching property
    if (
      schema.hasOwnProperty(property) &&
      schema[property].matchingProperty === name
    )
      return property;
  }
}
