'use strict';

export type RestrictionValue = string | number | (string | number)[];

export type CustomRestrictionHandler = (scopeVal: RestrictionValue) => boolean |  Promise<boolean>;

export interface TargetRestrictions {
    [key: string]: RestrictionValue | CustomRestrictionHandler;
}

type ScopeTuple = [string, string, { [key: string]: RestrictionValue }];

function asArray(value: RestrictionValue | undefined | null): RestrictionValue[] {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

async function isScopeRestrictionOK(
    scopeRestrictionName: string,
    scopeRestrictionValue: RestrictionValue,
    targetRestrictions: TargetRestrictions
): Promise<boolean> {
    const targetDetail = targetRestrictions[scopeRestrictionName];

    // Handle function-based target restrictions (sync or async)
    if (typeof targetDetail === 'function') {
        const result = targetDetail(scopeRestrictionValue);
        return result instanceof Promise ? await result : result;
    }

    // Handle plain value-based target restrictions
    const targetValues = asArray(targetDetail as RestrictionValue | undefined | null);
    const scopeValues = asArray(scopeRestrictionValue);

    if (targetValues.length && scopeValues.length) {
        return targetValues.every(value => scopeValues.includes(value));
    }
    // If target has no specific values for this restriction, or scope has no values,
    // it's considered met if the scope doesn't impose any specific values (empty scopeValues).
    return scopeValues.length === 0;
}

// Helper function to check if all restrictions for a single scope are met against the target restrictions.
async function _areAllScopeRestrictionsMet(
    scopeOwnRestrictions: { [key: string]: RestrictionValue },
    targetRestrictions: TargetRestrictions
): Promise<boolean> {
    for (const [scopeRestrictionName, scopeRestrictionValue] of Object.entries(scopeOwnRestrictions)) {
        const isOk = await isScopeRestrictionOK(scopeRestrictionName, scopeRestrictionValue, targetRestrictions);
        if (!isOk) {
            return false; // If any restriction is not met, this scope is not a match.
        }
    }
    return true; // All restrictions for this scope are met.
}

/**
 * Checks if an action is allowed based on the provided scopes and target restrictions.
 * Supports synchronous and asynchronous function-based target restrictions.
 *
 * @param {ScopeTuple[]} scopes
 * @param {string} targetResource
 * @param {TargetRestrictions} [targetRestrictions={}]
 * @returns {Promise<boolean>} True if allowed, false otherwise.
 */
export async function isAllowed(
    scopes: ScopeTuple[],
    targetResource: string,
    targetRestrictions: TargetRestrictions = {}
): Promise<boolean> {
    const multipleTargetRestrictions = Object.keys(targetRestrictions).length > 1;
    const multipleRestrictionsInScopes = scopes.some(scope => Object.keys(scope[2]).length > 1);

    // Current implementation limitation: does not support multiple restrictions.
    if (multipleTargetRestrictions || multipleRestrictionsInScopes) {
        throw Error('Multiple restrictions not implemented yet');
    }

    // Iterate through each scope to find if any grants permission.
    for (const [scopeResource, /* methods */, scopeOwnRestrictions] of scopes) {
        // Skip scopes that are not for the target resource.
        if (scopeResource !== targetResource) {
            continue;
        }

        // Check if all restrictions defined in the current scope are met by the target.
        if (await _areAllScopeRestrictionsMet(scopeOwnRestrictions, targetRestrictions)) {
            return true; // Found a scope that satisfies all its restrictions for the target.
        }
    }

    // No scope satisfied the conditions.
    return false;
}
