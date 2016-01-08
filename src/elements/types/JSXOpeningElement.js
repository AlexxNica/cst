import Node from '../Node';

// TODO: create JSXBoundaryElement?
export default class JSXOpeningElement extends Node {
    constructor(childNodes) {
        super('JSXOpeningElement', childNodes);
    }

    _acceptChildren(children) {
        let attributes = [];
        let selfClosing = false;

        children.passToken('Punctuator', '<');
        children.skipNonCode();
        let name = children.passOneOfNode(['JSXIdentifier', 'JSXMemberExpression', 'JSXNamespacedName']);
        children.skipNonCode();

        while (true) {
            if (children.isNode('JSXAttribute')) {
                children.skipNonCode();
                attributes.push(children.passNode('JSXAttribute'));
                children.skipNonCode();
            } else if (children.isNode('JSXSpreadAttribute')) {
                children.skipNonCode();
                attributes.push(children.passNode('JSXSpreadAttribute'));
                children.skipNonCode();
            } else {
                break;
            }
        }

        if (children.isToken('Punctuator', '/')) {
            children.skipNonCode();
            children.passToken('Punctuator', '/');
            selfClosing = true;
            children.skipNonCode();
        }

        children.passToken('Punctuator', '>');
        children.assertEnd();

        this._name = name;
        this._attributes = attributes;
        this._selfClosing = selfClosing;
    }

    get name() {
        return this._name;
    }

    get attributes() {
        return this._attributes;
    }

    get selfClosing() {
        return this._selfClosing;
    }
}
