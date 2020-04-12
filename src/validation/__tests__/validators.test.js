import * as Validators from "../lib";

const ERROR_MESSAGE = "error message";

describe("Validators", () => {
  const validators = [
    {
      func: Validators.digit(ERROR_MESSAGE),
      valid: "1",
      invalid: "a",
      description: "digit validator contains a digit",
    },
    {
      func: Validators.email(ERROR_MESSAGE),
      valid: "abc@def.ghi",
      invalid: "a",
      description: "email validator is a valid email",
    },
    {
      func: Validators.lowercase(ERROR_MESSAGE),
      valid: "abc",
      invalid: "ABC",
      description: "lowercase validator contains a lowercase character",
    },
    {
      func: Validators.matches(ERROR_MESSAGE)("abc"),
      valid: "abc",
      invalid: "ABC",
      description: "matching validator matches that of the matching property",
    },
    {
      func: Validators.maxLength(2, ERROR_MESSAGE),
      valid: "ab",
      invalid: "ABC",
      description: "max length validator at most the given length",
    },
    {
      func: Validators.minLength(2, ERROR_MESSAGE),
      valid: "ab",
      invalid: "A",
      description: "min length validator at least the given length",
    },
    {
      func: Validators.pattern(/abc/, ERROR_MESSAGE),
      valid: "abc",
      invalid: "A",
      description: "regex pattern validator matches pattern",
    },
    {
      func: Validators.symbol(ERROR_MESSAGE),
      valid: "abc.",
      invalid: "A",
      description: "regex pattern validator matches pattern",
    },
    {
      func: Validators.uppercase(ERROR_MESSAGE),
      valid: "Abc",
      invalid: "abc",
      description: "uppercase validator contains a uppercase character",
    },
  ];

  validators.forEach(({ func, valid, invalid, description }) => {
    test(`should return true when value passed to ${description} or an error message if not`, () => {
      expect(func(valid)).toBe(true);
      expect(func(invalid)).toBe(ERROR_MESSAGE);
    });
  });
});

// import {
//   EMAIL,
//   DIGIT,
//   SYMBOL,
//   LOWERCASE,
//   UPPERCASE,
//   getPatternRule,
//   getMatchesRule,
//   getMinLengthRule,
//   getMaxLengthRule,
// } from "../rules";

// const DEFAULT_LENGTH = 2;
// const Rules = {
//   EMAIL,
//   DIGIT,
//   SYMBOL,
//   LOWERCASE,
//   UPPERCASE,
//   getPatternRule,
//   getMaxLengthRule,
//   getMinLengthRule,
// };

// describe("Validation Rules", () => {
//   const testParams = {
//     EMAIL: { validInput: "abc@def.com", invalidInput: "a" },
//     DIGIT: { validInput: "1", invalidInput: "a" },
//     SYMBOL: { validInput: "$", invalidInput: "a" },
//     LOWERCASE: { validInput: "a", invalidInput: "A" },
//     UPPERCASE: { validInput: "A", invalidInput: "a" },
//     getPatternRule: { validInput: DEFAULT_LENGTH, invalidInput: "a" },
//     getMinLengthRule: { validInput: "aa", invalidInput: "a" },
//     getMaxLengthRule: { validInput: "aa", invalidInput: "aaa" },
//   };

//   function setup(key) {
//     const pattern = Rules[key].pattern || Rules[key](DEFAULT_LENGTH).pattern;

//     let title = key;
//     if (key === Rules.getMaxLengthRule.name) {
//       title = "MAX LENGTH";
//     }

//     if (key === Rules.getMinLengthRule.name) {
//       title = "MIN LENGTH";
//     }

//     return { pattern, title };
//   }

//   for (const key in Rules) {
//     if (Rules.hasOwnProperty(key)) {
//       const { pattern, title } = setup(key);

//       test(`${title} regex pattern matches correctly`, () => {
//         expect(pattern.test(testParams[key].invalidInput)).toBe(false);
//         expect(pattern.test(testParams[key].validInput)).toBe(true);
//       });
//     }
//   }

//   test("Matches regex pattern tests correctly", () => {
//     const matchingValue = "abc";
//     const { pattern } = getMatchesRule(matchingValue);

//     expect(pattern.test(matchingValue)).toBe(true);
//   });
// });
