//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const FIXABLE_GETTERS = [
    "styles",
    "properties",
    "scopedElements",
    "localizeNamespaces",
];

function getReturnedObject(node) {
    return node?.value?.body?.body[0]?.argument;
}

function getIdentifierName(node) {
    return node?.key;
}

function setupStaticObject(staticFunctionName, returnedObject) {
    return `static ${staticFunctionName} = ${returnedObject};`;
}

module.exports = {
    meta: {
        type: "suggestion",
        fixable: "code",
        docs: {
            description: "Simplify gettter functions",
            recommended: true,
            url: "https://dev.azure.com/IngEurCDaaS01/IngOne/_git/P20594-eslint-plugin-ow?path=/docs/rules/simplify-getters.md&_a=preview",
        },
    },
    create(context) {
        return {
            MethodDefinition(node) {
                if (
                    node?.kind === "get" &&
                    node?.static &&
                    FIXABLE_GETTERS.includes(node?.key?.name)
                ) {
                    context.report({
                        node,
                        message: `Use static class fields instead of getter functions`,
                        fix: function (fixer) {
                            const sourceCode = context.getSourceCode();
                            const staticFunctionName = sourceCode.getText(
                                getIdentifierName(node)
                            );
                            const returnedObject = sourceCode.getText(
                                getReturnedObject(node)
                            );
                            const refactoredStaticObject = setupStaticObject(
                                staticFunctionName,
                                returnedObject
                            );

                            return fixer.replaceText(node, refactoredStaticObject);
                        },
                    });
                }
            },
        };
    },
};
