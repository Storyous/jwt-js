import * as assert from 'assert';
import { isAllowed, Scope, Restriction } from '../src';
import { describe, it } from 'mocha';
import { TargetRestrictions } from '../src/isAllowed';

describe('isAllowed', () => {

    const testCases: {
        expect: boolean;
        scopes: Scope[];
        resource: string;
        restrictions?: TargetRestrictions
    }[] = [

        { expect: false, scopes: [], resource: 'a', },

        { expect: false, scopes: [], resource: 'a', restrictions: {} },

        { expect: false, scopes: [], resource: 'a', restrictions: { r1: 'v1' } },

        {
            expect: true,
            resource: 'a', restrictions: { r1: 'v1' },
            scopes: [new Scope('a', [new Restriction('r1', ['v1', 'v2'])], "rw")]
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: 'v3' },
            scopes: [new Scope('a', [new Restriction('r1', ['v1', 'v2'])], "rw")]
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: 'v1' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")]
        },

        {
            expect: true,
            resource: 'a', restrictions: { r1: 'v1', r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")]
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: 'v1', r2: 'v5' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")]
        },

        {
            expect: false,
            resource: 'C', restrictions: { r1: 'v1', r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")]
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: ['v1', 'v5'], r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")]
        },

        {
            expect: true,
            resource: 'a', restrictions: { r1: ['v1', 'v2'], r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")]
        },
    ];

    testCases.forEach(({ scopes, resource, restrictions, expect }, i) => {

        let fn = it;
        const multipleRestrictions = restrictions && Object.keys(restrictions).length > 1;
        const multipleScopes = scopes.some(scope => scope.restrictions.length > 1);
        const shouldThrow = multipleRestrictions || multipleScopes;

        /*// UNCOMMENT TO TEST SINGLE CASE
        if ((i + 1) !== 4) {
            return;
        }*/

        fn(`should work for case ${ i + 1 }`, () => {
            const encodedScopes = scopes.map(scope => scope.toArray());

            if (!shouldThrow) {
                assert.equal(isAllowed(encodedScopes, resource, restrictions), expect);
            } else {
                assert.throws(() => {
                    isAllowed(encodedScopes, resource, restrictions);
                });
            }
        });

    });



});


