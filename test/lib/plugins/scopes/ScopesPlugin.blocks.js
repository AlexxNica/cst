import {expect} from 'chai';
import ScopesPlugin from '../../../../src/plugins/scopes/ScopesPlugin';
import {parseAndGetProgram} from '../../../utils';

function parse(codeLines) {
    return parseAndGetProgram([].concat(codeLines).join('\n'), {
        plugins: [new ScopesPlugin()]
    });
}

describe('ScopesPlugin', () => {
    describe('blocks', () => {
        it('should support custom block', () => {
            let program = parse([
                'let a = 1;',
                '{',
                    'let a = 2;',
                '}'
            ]);
            let globalScope = program.plugins.scopes.acquire(program);

            let variableA1 = globalScope.variables[0];
            expect(variableA1.name).to.equal('a');
            expect(variableA1.type).to.equal('LetVariable');
            expect(variableA1.references[0].node.parentElement.init.value).to.equal(1);

            let variableA2 = globalScope.childScopes[0].variables[0];
            expect(variableA2.name).to.equal('a');
            expect(variableA2.type).to.equal('LetVariable');
            expect(variableA2.references[0].node.parentElement.init.value).to.equal(2);
        });

        it('should support if block', () => {
            let program = parse([
                'let a = 1;',
                'if (true) {',
                    'let a = 2;',
                '}'
            ]);
            let globalScope = program.plugins.scopes.acquire(program);

            let variableA1 = globalScope.variables[0];
            expect(variableA1.name).to.equal('a');
            expect(variableA1.type).to.equal('LetVariable');
            expect(variableA1.references[0].node.parentElement.init.value).to.equal(1);

            let variableA2 = globalScope.childScopes[0].variables[0];
            expect(variableA2.name).to.equal('a');
            expect(variableA2.type).to.equal('LetVariable');
            expect(variableA1.references[0].node.parentElement.init.value).to.equal(1);
        });

        it('should support for block', () => {
            let program = parse([
                'let a = 1;',
                'for (let a = 2;;) {',
                    'let a = 3;',
                '}'
            ]);
            let globalScope = program.plugins.scopes.acquire(program);

            let variableA1 = globalScope.variables[0];
            expect(variableA1.name).to.equal('a');
            expect(variableA1.type).to.equal('LetVariable');
            expect(variableA1.definitions[0].node.parentElement.init.value).to.equal(1);
            expect(variableA1.references[0].node.parentElement.init.value).to.equal(1);

            let variableA2 = globalScope.childScopes[0].variables[0];
            expect(variableA2.name).to.equal('a');
            expect(variableA2.type).to.equal('LetVariable');
            expect(variableA2.definitions[0].node.parentElement.init.value).to.equal(2);
            expect(variableA2.definitions[1].node.parentElement.init.value).to.equal(3);
            expect(variableA2.references[0].node.parentElement.init.value).to.equal(2);
            expect(variableA2.references[1].node.parentElement.init.value).to.equal(3);
        });

        it('should support for-in block', () => {
            let program = parse([
                'let a = 1;',
                'for (let a in 2) {',
                    'let a = 3;',
                '}'
            ]);
            let globalScope = program.plugins.scopes.acquire(program);

            let variableA1 = globalScope.variables[0];
            expect(variableA1.name).to.equal('a');
            expect(variableA1.type).to.equal('LetVariable');
            expect(variableA1.definitions[0].node.parentElement.init.value).to.equal(1);
            expect(variableA1.references[0].node.parentElement.init.value).to.equal(1);

            let variableA2 = globalScope.childScopes[0].variables[0];
            expect(variableA2.name).to.equal('a');
            expect(variableA2.type).to.equal('LetVariable');
            expect(variableA2.definitions[0].node.parentElement.parentElement.parentElement.right.value).to.equal(2);
            expect(variableA2.definitions[1].node.parentElement.init.value).to.equal(3);
            expect(variableA2.references[0].node.parentElement.parentElement.parentElement.right.value).to.equal(2);
            expect(variableA2.references[0].isWriteOnly).to.equal(true);
            expect(variableA2.references[1].node.parentElement.init.value).to.equal(3);
            expect(variableA2.references[1].isWriteOnly).to.equal(true);
        });

        it('should support for-in block', () => {
            let program = parse([
                'let a = 1;',
                'for (let a of 2) {',
                    'let a = 3;',
                '}'
            ]);
            let globalScope = program.plugins.scopes.acquire(program);

            let variableA1 = globalScope.variables[0];
            expect(variableA1.name).to.equal('a');
            expect(variableA1.type).to.equal('LetVariable');
            expect(variableA1.definitions[0].node.parentElement.init.value).to.equal(1);
            expect(variableA1.references[0].node.parentElement.init.value).to.equal(1);

            let variableA2 = globalScope.childScopes[0].variables[0];
            expect(variableA2.name).to.equal('a');
            expect(variableA2.type).to.equal('LetVariable');
            expect(variableA2.definitions[0].node.parentElement.parentElement.parentElement.right.value).to.equal(2);
            expect(variableA2.definitions[1].node.parentElement.init.value).to.equal(3);
            expect(variableA2.references[0].node.parentElement.parentElement.parentElement.right.value).to.equal(2);
            expect(variableA2.references[0].isWriteOnly).to.equal(true);
            expect(variableA2.references[1].node.parentElement.init.value).to.equal(3);
            expect(variableA2.references[1].isWriteOnly).to.equal(true);
        });

        it('should support try-catch block', () => {
            let program = parse([
                'var a = 1;',
                'try {',
                    'let a = 2;',
                '} catch (a) {',
                    'a = 3;',
                '}'
            ]);
            let globalScope = program.plugins.scopes.acquire(program);

            let variableA1 = globalScope.variables[0];
            expect(variableA1.name).to.equal('a');
            expect(variableA1.type).to.equal('Variable');
            expect(variableA1.definitions[0].node.parentElement.init.value).to.equal(1);
            expect(variableA1.references[0].node.parentElement.init.value).to.equal(1);

            let variableA2 = globalScope.childScopes[0].variables[0];
            expect(variableA2.name).to.equal('a');
            expect(variableA2.type).to.equal('LetVariable');
            expect(variableA2.definitions[0].node.parentElement.init.value).to.equal(2);
            expect(variableA2.references[0].node.parentElement.init.value).to.equal(2);
            expect(variableA2.references[0].isWriteOnly).to.equal(true);

            let variableA3 = globalScope.childScopes[1].variables[0];
            expect(variableA3.name).to.equal('a');
            expect(variableA3.type).to.equal('CatchClauseError');
            expect(variableA3.definitions[0].node.parentElement.type).to.equal('CatchClause');
            expect(variableA3.references[0].node.parentElement.right.value).to.equal(3);
            expect(variableA3.references[0].isWriteOnly).to.equal(true);
        });

        it('should support patterns try-catch block', () => {
            let program = parse([
                'try {',
                '} catch ({ a, b, c, d }) {',
                    'let e = 20;',
                    'a;',
                    'b;',
                    'let c = 30;',
                    'c;',
                    'd;',
                '}'
            ]);
            let globalScope = program.plugins.scopes.acquire(program);

            expect(globalScope.variables.length).to.equal(0);

            let variableA = globalScope.childScopes[1].variables[0];
            expect(variableA.name).to.equal('a');
            expect(variableA.type).to.equal('CatchClauseError');
            expect(variableA.definitions[0].node.parentElement.type).to.equal('Property');
            expect(variableA.references[0].node.parentElement.type).to.equal('ExpressionStatement');

            let variableB = globalScope.childScopes[1].variables[1];
            expect(variableB.name).to.equal('b');
            expect(variableB.type).to.equal('CatchClauseError');
            expect(variableB.definitions[0].node.parentElement.type).to.equal('Property');
            expect(variableB.references[0].node.parentElement.type).to.equal('ExpressionStatement');

            let variableC1 = globalScope.childScopes[1].variables[2];
            expect(variableC1.name).to.equal('c');
            expect(variableC1.type).to.equal('LetVariable');
            expect(variableC1.definitions[0].node.parentElement.type).to.equal('VariableDeclarator');
            expect(variableC1.references[0].node.parentElement.type).to.equal('ExpressionStatement');

            let variableC2 = globalScope.childScopes[1].variables[3];
            expect(variableC2.name).to.equal('c');
            expect(variableC2.type).to.equal('CatchClauseError');
            expect(variableC2.definitions[0].node.parentElement.type).to.equal('Property');

            let variableD = globalScope.childScopes[1].variables[4];
            expect(variableD.name).to.equal('d');
            expect(variableD.type).to.equal('CatchClauseError');
            expect(variableD.definitions[0].node.parentElement.type).to.equal('Property');
            expect(variableD.references[0].node.parentElement.type).to.equal('ExpressionStatement');

            let variableE = globalScope.childScopes[1].variables[5];
            expect(variableE.name).to.equal('e');
            expect(variableE.type).to.equal('LetVariable');
            expect(variableE.definitions[0].node.parentElement.type).to.equal('VariableDeclarator');
            expect(variableE.references[0].node.parentElement.type).to.equal('VariableDeclarator');
        });
    });
});