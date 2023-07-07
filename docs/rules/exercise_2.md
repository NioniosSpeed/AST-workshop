# Use static class fields instead of getter functions


## Rule Details
In order to simplify the static fields that are used very often (`'properties'`, `'styles'`, `'scopedElements'`, `'localizeNamespaces'`) you can replace the getter functions with static class fields.
The rule throws a warning when it detects such implementations and it comes with a fixer function that can be used to refactor your code.

Examples of **incorrect** code for this rule:

```js
  static get properties() {
    return {
        _transactions: { type: Array },
        _transaction: { type: Object }
    };
  };
```

Examples of **correct** code for this rule:

```js
  static properties = {
    _transactions: { type: Array },
    _transaction: { type: Object }
  };
```
