'use strict';

// Define types for better clarity and type safety
export type ScopeValue = string | number | (string | number)[];

export interface TargetRestrictions {
    [key: string]: ScopeValue;
}

// Assuming scope structure from Scope.ts: [string, string, FormattedRestrictions]
// where FormattedRestrictions is { [key: string]: ScopeValue }

type ScopeTuple = [string, string, { [key: string]: ScopeValue }];

function asArray(value: ScopeValue | undefined | null): ScopeValue[] {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function isScopeRestrictionOK(
    scopeRestrictionName: string,
    scopeRestrictionValue: ScopeValue,
    targetRestrictions: TargetRestrictions
): boolean {
    const targetValues = asArray(targetRestrictions[scopeRestrictionName]);
    const scopeValues = asArray(scopeRestrictionValue);

    // If target has specific values for this restriction, all must be present in the scope's allowed values
    if (targetValues.length && scopeValues.length) {
        return targetValues.every(value => scopeValues.includes(value));
    }
    // is field limited at all?
    return scopeValues.length === 0;
}

/**
 * @todo read and write restrictions
 *
 * @param {ScopeTuple[]} scopes
 * @param {string} targetResource
 * @param {TargetRestrictions} [targetRestrictions={}]
 */
export function isAllowed(
    scopes: ScopeTuple[],
    targetResource: string,
    targetRestrictions: TargetRestrictions = {}
): boolean {
    const multipleTargetRestrictions = Object.keys(targetRestrictions).length > 1;
    const multipleRestrictions = scopes.some(scope => Object.keys(scope[2]).length > 1);

    if (multipleTargetRestrictions || multipleRestrictions) {
        throw Error('Multiple restrictions not implemented yet');
    }

    return scopes.some(([scopeResource, methods, scopeRestrictions]) => {
        if (scopeResource !== targetResource) {
            return false;
        }

        // Check if all target restrictions are satisfied by the current scope
        return Object.entries(scopeRestrictions).every(
            ([scopeRestrictionName, scopeRestrictionValue]) =>
                isScopeRestrictionOK(scopeRestrictionName, scopeRestrictionValue, targetRestrictions)
        );
    });
}

