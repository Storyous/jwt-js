'use strict';

const assert = require('assert');
const { isAllowed, Scope, Restriction } = require('../src');

describe('isAllowed', () => {

    const testCases = [

        { expect: false, scopes: [], resource: 'a', },

        { expect: false, scopes: [], resource: 'a', restrictions: {} },

        { expect: false, scopes: [], resource: 'a', restrictions: { r1: 'v1' } },

        {
            expect: true,
            resource: 'a', restrictions: { r1: 'v1' },
            scopes: [new Scope('a', [new Restriction('r1', ['v1', 'v2'])])]
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: 'v3' },
            scopes: [new Scope('a', [new Restriction('r1', ['v1', 'v2'])])]
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: 'v1' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ])]
        },

        {
            expect: true,
            resource: 'a', restrictions: { r1: 'v1', r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ])]
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: 'v1', r2: 'v5' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ])]
        },

        {
            expect: false,
            resource: 'C', restrictions: { r1: 'v1', r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ])]
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: ['v1', 'v5'], r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ])]
        },

        {
            expect: true,
            resource: 'a', restrictions: { r1: ['v1', 'v2'], r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ])]
        },
    ];

    testCases.forEach(({ scopes, resource, restrictions, expect }, i) => {

        /*// UNCOMMENT TO TEST SINGLE CASE
        if ((i + 1) !== 4) {
            return;
        }*/

        it(`should work for case ${ i + 1 }`, () => {
            const encodedScopes = scopes.map(scope => scope.toArray());
            assert.equal(isAllowed(encodedScopes, resource, restrictions), expect);
        });

    });



});


