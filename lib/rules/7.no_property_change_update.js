const superUpdateQuery =
    'CallExpression' +
    '[callee.object.type = "Super"]' +
    '[callee.property.name = "update"]';

function getIdentifierName(node){
    if (node.type === 'Identifier') {
        return node.name;
    }
    if (node.type === 'Literal') {
        return node.raw;
    }
    return undefined;
}

function extractPropertyEntry(key, value) {
    let state = false;
    let attribute = true;

    for (const prop of value.properties) {
        if (
            prop.type === 'Property' &&
            prop.key.type === 'Identifier' &&
            prop.value.type === 'Literal'
        ) {
            if (prop.key.name === 'state' && prop.value.value === true) {
                state = true;
            } else if (prop.key.name === 'attribute' && prop.value.value === false) {
                attribute = false;
            }
        }
    }

    return {
        expr: value,
        key,
        state,
        attribute
    };
}
function getPropertyMap(node) {
    const result = new Map();
    const propertyDecorators = ['state', 'property', 'internalProperty'];
    const internalDecorators = ['state', 'internalProperty'];

    for (const member of node.body.body) {
        if (
            member.type === 'PropertyDefinition' &&
            member.static &&
            member.key.type === 'Identifier' &&
            member.key.name === 'properties' &&
            member.value?.type === 'ObjectExpression'
        ) {
            for (const prop of member.value.properties) {
                if (prop.type === 'Property') {
                    const name = getIdentifierName(prop.key);

                    if (name && prop.value.type === 'ObjectExpression') {
                        result.set(name, extractPropertyEntry(prop.key, prop.value));
                    }
                }
            }
        }

        if (
            member.type === 'MethodDefinition' &&
            member.static &&
            member.kind === 'get' &&
            member.key.type === 'Identifier' &&
            member.key.name === 'properties' &&
            member.value.body
        ) {
            const ret = member.value.body.body.find(
                (m) =>
                m.type === 'ReturnStatement' &&
                m.argument?.type === 'ObjectExpression'
        );
            if (ret) {
                const arg = ret.argument;
                for (const prop of arg.properties) {
                    if (prop.type === 'Property') {
                        const name = getIdentifierName(prop.key);

                        if (name && prop.value.type === 'ObjectExpression') {
                            result.set(name, extractPropertyEntry(prop.key, prop.value));
                        }
                    }
                }
            }
        }

        if (
            member.type === 'MethodDefinition' ||
            member.type === 'PropertyDefinition'
        ) {
            const babelProp = member;
            const key = member.key;
            const memberName = getIdentifierName(key);

            if (memberName && babelProp.decorators) {
                for (const decorator of babelProp.decorators) {
                    if (
                        decorator.expression.type === 'CallExpression' &&
                        decorator.expression.callee.type === 'Identifier' &&
                        propertyDecorators.includes(decorator.expression.callee.name)
                    ) {
                        const dArg = decorator.expression.arguments[0];
                        if (dArg?.type === 'ObjectExpression') {
                            const state = internalDecorators.includes(
                                decorator.expression.callee.name
                            );
                            const entry = extractPropertyEntry(key, dArg);
                            if (state) {
                                entry.state = true;
                            }
                            result.set(memberName, entry);
                        } else {
                            const state = internalDecorators.includes(
                                decorator.expression.callee.name
                            );
                            result.set(memberName, {
                                key,
                                expr: null,
                                state,
                                attribute: true
                            });
                        }
                    }
                }
            }
        }
    }

    return result;
}
module.exports = {
    meta: {
        docs: {
            description:
                'Disallows property changes in the `update` lifecycle method',
            recommended: false,
            url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-property-change-update.md'
        },
        schema: [],
        messages: {
            propertyChange:
                'Properties should not be changed in the update lifecycle method as' +
                ' they will not trigger re-renders'
        }
    },
    create(context) {
        // variables should be defined here
        let propertyMap = new Map();
        let inUpdate = false;
        let superSeen = false;

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Class entered
         */
        function classEnter(node) {
            if (
                !node.superClass ||
                node.superClass.type !== 'Identifier' ||
                node.superClass.name !== 'LitElement'
            ) {
                return;
            }

            const props = getPropertyMap(node);

            if (props) {
                propertyMap = props;
            }
        }

        /**
         * Class exited
         */
        function classExit() {
            propertyMap = null;
        }

        /**
         * Method entered
         */
        function methodEnter(node) {
            if (
                !propertyMap ||
                node.static === true ||
                node.kind !== 'method' ||
                node.key.type !== 'Identifier' ||
                node.key.name !== 'update'
            ) {
                return;
            }

            inUpdate = true;
        }

        /**
         * Method exited
         */
        function methodExit() {
            inUpdate = false;
            superSeen = false;
        }

        /**
         * Assignment expression entered
         */
        function assignmentFound(node) {
            if (
                !superSeen ||
                !propertyMap ||
                !inUpdate ||
                node.left.type !== 'MemberExpression' ||
                node.left.object.type !== 'ThisExpression' ||
                node.left.property.type !== 'Identifier'
            ) {
                return;
            }

            const hasProp = propertyMap.has(node.left.property.name);

            if (!hasProp) {
                return;
            }

            context.report({
                node: node,
                messageId: 'propertyChange'
            });
        }

        /**
         * `super.update()` call found
         */
        function superUpdateFound() {
            if (!inUpdate) {
                return;
            }
            superSeen = true;
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            ClassExpression: (node) =>
                classEnter(node),
            ClassDeclaration: (node) =>
                classEnter(node),
            'ClassExpression:exit': classExit,
            'ClassDeclaration:exit': classExit,
            MethodDefinition: (node) =>
                methodEnter(node),
            'MethodDefinition:exit': methodExit,
            AssignmentExpression: (node) =>
                assignmentFound(node),
            [superUpdateQuery]: () => superUpdateFound()
        };
    }
}

