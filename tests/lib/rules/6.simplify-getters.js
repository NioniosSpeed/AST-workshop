//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/6.simplify_getters.js");
const RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new RuleTester({
    parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
    },
});

ruleTester.run("simplify-getters", rule, {
    valid: [
        {
            code: `class Foo {static properties = { _transactions: { type: Array }, _transaction: { type: Object } }};`,
        },
    ],
    invalid: [
        {
            code: `class Foo {static get properties() { return { _transactions: { type: Array }, _transaction: { type: Object } }}};`,
            output: `class Foo {static properties = { _transactions: { type: Array }, _transaction: { type: Object } };};`,
            errors: [
                { message: `Use static class fields instead of getter functions` },
            ],
        },
    ],
});
