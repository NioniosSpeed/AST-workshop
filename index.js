'use strict';

const requireIndex = require('requireindex');

module.exports = {
  rules: requireIndex(`${__dirname}/lib/rules`),
  configs: {
    recommended: {
      plugins: ['ow'],
      rules: {
        'ow/no-bare-ing-web-import': 'error',
        'ow/simplify-getters': 'warn',
      },
    },
  },
};
