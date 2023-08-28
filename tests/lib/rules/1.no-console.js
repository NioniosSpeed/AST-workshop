const rule = require('../../../lib/rules/1.no_console.js');
const RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new RuleTester();

ruleTester.run('exercise 1', rule, {
  valid: [{code: 'foo()'}],
  invalid: [
    {
      code: `console.log()`,
      errors: [
        {
          message: `Don't use console`,
        },
      ],
    },
    {
      code: `console.info()`,
      errors: [
        {
          message: `Don't use console`,
        },
      ],
    },
    {
      code: `console.error()`,
      errors: [
        {
          message: `Don't use console`,
        },
      ],
    },
  ],
});
