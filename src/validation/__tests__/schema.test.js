import Schema from "../schema";
import { ERROR_MESSAGES as Errors } from "../constants";

describe("Schema", () => {
  test("should set all validation rules", () => {
    const schema = new Schema()
      .hasDigit()
      .hasSymbol()
      .hasLowercase()
      .hasUppercase()
      .validateSchema();

    expect(schema.rules.length).toBe(4);
  });

  describe("Special validation rules", () => {
    const specialProperties = [
      {
        name: "matching property",
        schema: new Schema().hasDigit().matches("abc").validateSchema(),
      },
      {
        name: "email",
        schema: new Schema().hasDigit().isEmail().validateSchema(),
      },
      {
        name: "pattern",
        schema: new Schema().hasDigit().hasPattern(/abc/).validateSchema(),
      },
    ];

    specialProperties.forEach(({ name, schema }) => {
      test(`should return label, required status and only the ${name} rule when set`, () => {
        expect(schema.label).not.toBe(null);
        expect(schema.required).not.toBe(null);
        expect(schema.rules.length).toBe(1);
      });
    });
  });

  describe("Min max validation", () => {
    test("should throw error when minimum length is greater than the maximum length", () => {
      expect(() => new Schema().min(3).max(2).validateSchema()).toThrow(
        Errors.INVALID_MIN_OVER_MAX
      );
    });

    test("should throw error when the number of characters required for successful validation in greater than the minimum or maximum", () => {
      expect(() =>
        new Schema().hasDigit().hasLowercase().min(1).validateSchema()
      ).toThrow(Errors.INVALID_MIN_MAX);

      expect(() =>
        new Schema().hasDigit().hasLowercase().max(1).validateSchema()
      ).toThrow(Errors.INVALID_MIN_MAX);
    });

    test("should throw RangeError when minimum or maximum length is negative", () => {
      expect(() => new Schema().min(-1)).toThrowError(RangeError);
      expect(() => new Schema().max(-1)).toThrowError(RangeError);
    });
  });

  describe("Input validation", () => {
    const inputValues = [
      { name: "min or max", type: "number", func: "max", arg: "a" },
      { name: "min", type: "number", func: "min", arg: "a" },
      { name: "label", type: "string", func: "label", arg: 123 },
      {
        arg: 1,
        name: "matching property",
        type: "string",
        func: "matches",
      },
    ];

    inputValues.forEach(({ name, type, func, arg }) => {
      test(`should throw TypeError when ${name} is not a ${type}`, () => {
        expect(() => new Schema()[func](arg)).toThrowError(TypeError);
      });
    });

    test("should throw error when given matching property name or label is an empty string", () => {
      expect(() => new Schema().label("")).toThrow();
      expect(() => new Schema().matches("")).toThrow();
    });
  });
});
