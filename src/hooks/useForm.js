import { useState } from "react";

import { validate } from "../validation";

/**
 * Hook to handle underlying form functionality such as setting input changes,
 * errors, form and property validation and form submission
 * @param {Object} formSchema schema of whole form
 * @param {Object} defaultState object with properties corresponding to form elements
 * @param {Object} defaultErrors form errors
 */
export default function useForm(formSchema, defaultState, defaultErrors) {
  /************************************
   * State
   ************************************/

  const [formData, setFormData] = useState(
    defaultState || mapState(formSchema)
  );

  const [formErrors, setFormErrors] = useState(defaultErrors || {});
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  /************************************
   * Helper Functions
   ************************************/

  /**
   * Handles validating form and calling submitCallback
   * @param {Event} event form submit event
   * @param {Function} validateForm user validation function to be called
   * @param {Function} submitForm async function that does actual submission
   */
  async function handleSubmit(event, submitForm) {
    event.preventDefault();
    setSubmitErrorMessage("");

    const { isValid, errors } = validate(formData, formSchema);

    if (isValid) {
      try {
        await submitForm();
      } catch (error) {
        setSubmitErrorMessage(error.message);
      }
    } else {
      setFormErrors({ ...formErrors, ...errors });
    }
  }

  /**
   * Sets the appropriate state and errors. Validates the property
   * and allows user to run further validation
   * @param {Event} event onChange event
   * @param {Function} validateProperty user function for further
   * validation. Must return an array of errors
   */
  function handleInputChange(event) {
    const { name: propertyName, value } = event.target;
    setFormData({ ...formData, [propertyName]: value });
    validateProperty(value, formSchema[propertyName], propertyName);
  }

  /**
   * Clear the form of errors
   * @param {Event} event reset event
   */
  function handleReset() {
    setFormData(defaultState || mapState(formSchema));
    setFormErrors(defaultErrors || {});
    setSubmitErrorMessage("");
  }

  function validateProperty(value, schema, propertyName) {
    const matchingProperty = getMatchingProperty(
      schema,
      formSchema,
      propertyName
    );

    if (!matchingProperty) {
      const { errors } = validate(value, schema);
      setFormErrors({ ...formErrors, [propertyName]: errors });
      return;
    }

    // Matching properties present. ex: password & confirm password
    const newForm = {
      [propertyName]: value,
      [matchingProperty]: formData[matchingProperty]
    };
    const newSchema = {
      [propertyName]: schema,
      [matchingProperty]: formSchema[matchingProperty]
    };

    //Set errors; reset properties with previous errors
    const { errors } = validate(newForm, newSchema);
    const allErrors = { ...formErrors, ...errors };
    resetProperties(errors, allErrors, propertyName, matchingProperty);
    setFormErrors({ ...allErrors });
  }

  function resetProperties(errors, allErrors, propertyName, matchingProperty) {
    if (!errors[propertyName]) {
      delete allErrors[propertyName];
    }

    if (!errors[matchingProperty]) {
      delete allErrors[matchingProperty];
    }
  }

  function getMatchingProperty(schema, formSchema, propertyName) {
    if (schema.matchingProperty) return schema.matchingProperty;

    for (const property in formSchema) {
      if (property === propertyName) continue;

      if (
        formSchema.hasOwnProperty(property) &&
        formSchema[property].matchingProperty === propertyName
      ) {
        return property;
      }
    }
  }

  /**
   * Derive state from given schema
   * @param {object} schema
   */
  function mapState(schema) {
    const state = {};
    Object.keys(schema).forEach(property => {
      state[property] = "";
    });
    return state;
  }

  return {
    formData,
    formErrors,
    handleReset,
    handleSubmit,
    handleInputChange,
    submitErrorMessage
  };
}
