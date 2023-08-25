module.exports = {
  create(context) {
    return {
      Identifier(node) {
        if (node.name === 'console') {
          context.report({
            node,
            message: `Don't use console`,
          })
        }
      },
    }
  },
};
