import * as assert from 'assert';
import { isAllowed, Scope, Restriction } from '../src';
import { describe, it } from 'mocha';
import {RestrictionValue, TargetRestrictions} from '../src/isAllowed';

describe('isAllowed', () => {

    const MULTIPLE_RESTRICTIONS_ERROR_REGEX = /Multiple restrictions not implemented yet/;

    const testCases: {
        expect?: boolean; // Make expect optional as some tests will throw
        expectedErrorMessageRegex?: RegExp; // Add for specific error message checks
        only?: boolean; // Add for running a single test case
        scopes: Scope[];
        resource: string;
        restrictions?: TargetRestrictions;
    }[] = [

        { expect: false, scopes: [], resource: 'a' },

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
            ], "rw")],
            expectedErrorMessageRegex: MULTIPLE_RESTRICTIONS_ERROR_REGEX, // Expect multiple restrictions error
        },

        {
            expect: true, // This case should pass as it has multiple restrictions but they match
            resource: 'a', restrictions: { r1: 'v1', r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")],
            expectedErrorMessageRegex: MULTIPLE_RESTRICTIONS_ERROR_REGEX, // Expect multiple restrictions error
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: 'v1', r2: 'v5' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")],
            expectedErrorMessageRegex: MULTIPLE_RESTRICTIONS_ERROR_REGEX, // Expect multiple restrictions error
        },

        {
            expect: false,
            resource: 'C', restrictions: { r1: 'v1', r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")],
            expectedErrorMessageRegex: MULTIPLE_RESTRICTIONS_ERROR_REGEX, // Expect multiple restrictions error
        },

        {
            expect: false,
            resource: 'a', restrictions: { r1: ['v1', 'v5'], r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")],
            expectedErrorMessageRegex: MULTIPLE_RESTRICTIONS_ERROR_REGEX, // Expect multiple restrictions error
        },

        {
            expect: true,
            resource: 'a', restrictions: { r1: ['v1', 'v2'], r2: 'v4' },
            scopes: [new Scope('a', [
                new Restriction('r1', ['v1', 'v2']),
                new Restriction('r2', ['v3', 'v4']),
            ], "rw")],
            expectedErrorMessageRegex: MULTIPLE_RESTRICTIONS_ERROR_REGEX, // Expect multiple restrictions error
        },

        // Test cases for async restriction handlers
        {
            expect: true,
            resource: 'asyncResource',
            restrictions: {
                asyncRule: async (scopeVal: RestrictionValue) => {
                    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work
                    return scopeVal === 'accessGranted';
                }
            },
            scopes: [new Scope('asyncResource', [new Restriction('asyncRule', 'accessGranted')], "rw")]
        },
        {
            expect: false,
            resource: 'asyncResource',
            restrictions: {
                asyncRule: async (scopeVal: RestrictionValue) => {
                    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work
                    return scopeVal === 'accessGranted'; // Handler expects 'accessGranted'
                }
            },
            scopes: [new Scope('asyncResource', [new Restriction('asyncRule', 'accessDenied')], "rw")] // Scope provides 'accessDenied'
        },
        // New test case for a restriction function that throws an error
        {
            resource: 'errorResource',
            restrictions: {
                errorRule: async (_scopeVal: RestrictionValue) => {
                    await new Promise(resolve => setTimeout(resolve, 5)); // Simulate async work
                    throw new Error('Handler failed intentionally');
                }
            },
            scopes: [new Scope('errorResource', [new Restriction('errorRule', 'triggerFailure')], "rw")],
            expectedErrorMessageRegex: /Handler failed intentionally/,
        },
    ];

    testCases.forEach(({ scopes, resource, restrictions, expect, expectedErrorMessageRegex, only }, i) => {

        const testFunction = only ? it.only : it;

        testFunction(`should work for case ${ i + 1 }`, async () => { // 'it' was already async, which is correct
            const encodedScopes = scopes.map(scope => scope.toArray());

            if (expectedErrorMessageRegex) {
                // This case expects a specific error message (from a handler or multiple restrictions setup)
                await assert.rejects(
                    () => isAllowed(encodedScopes, resource, restrictions),
                    expectedErrorMessageRegex
                );
            } else {
                // This case expects a boolean result
                assert.equal(await isAllowed(encodedScopes, resource, restrictions), expect);
            }
        });

    });

});

