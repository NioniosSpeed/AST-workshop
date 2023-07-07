const rule = require('../../../lib/rules/exercise_2.js');
const RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new RuleTester();

ruleTester.run('no-alert', rule, {
  valid: ['foo.alert()', 'balert()', 'alerts()', `var x = alert`],
  invalid: [
    {
      code: `alert()`,
      errors: [
        {
          message: 'Using alert is not allowed',
          type: 'CallExpression',
        },
      ],
    },
  ],
})
