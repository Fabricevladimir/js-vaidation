import React, { useState } from "react";

import useForm from "../../hooks/useForm";
import { Schema } from "../../validation";
import "./DemoForm.css";

const defaultSchema = {
  password: new Schema()
    .min(5)
    .hasDigit()
    .hasSymbol()
    .isRequired()
    .validate(),

  username: new Schema()
    .min(5)
    .isRequired()
    .hasLowercase()
    .hasUppercase()
    .validate(),

  confirmPassword: new Schema()
    .matches("password")
    .isRequired()
    .validate()
};

const DemoForm = () => {
  const {
    formData,
    formErrors,
    handleReset,
    handleSubmit,
    handleInputChange,
    submitErrorMessage
  } = useForm(defaultSchema);

  const [submitError, setSubmitError] = useState(false);

  function doSubmit() {
    if (submitError) throw new Error("Error while submitting form");
    alert(`Submitted form with username ${formData.username}`);
  }

  return (
    <form
      className="form"
      onReset={handleReset}
      onSubmit={event => handleSubmit(event, doSubmit)}
    >
      <label htmlFor="submitError">
        Error when submitting
        <input
          id="submitError"
          type="checkbox"
          onChange={() => setSubmitError(!submitError)}
        />
      </label>
      <div className="property">
        <input
          name="username"
          type="text"
          placeholder="Username"
          onChange={handleInputChange}
        />
        <span>{formErrors["username"]}</span>
      </div>

      <div className="property">
        <input
          type="text"
          name="password"
          placeholder="Password"
          onChange={handleInputChange}
        />
        <span>{formErrors["password"]}</span>
      </div>

      <div className="property">
        <input
          type="text"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleInputChange}
        />
        <span>{formErrors["confirmPassword"]}</span>
      </div>

      <div className="actions">
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
        <span>{submitErrorMessage}</span>
      </div>
    </form>
  );
};

export default DemoForm;
