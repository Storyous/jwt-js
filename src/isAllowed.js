'use strict';

function asArray (value) {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function isScopeRestrictionOK (scopeRestrictionName, scopeRestrictionValue, targetRestrictions) {
    const targetValues = asArray(targetRestrictions[scopeRestrictionName]);
    const scopeValues = asArray(scopeRestrictionValue);
    if (targetValues.length && scopeValues.length) {
        return targetValues.every(value => scopeValues.includes(value));
    }
    return scopeValues.length === 0; // is field limited at all?
}

/**
 * @todo read and write restrictions
 *
 * @param {Array} scopes
 * @param {string} targetResource
 * @param {Object.<string,string|number|Array.<string|number>>} [targetRestrictions={}]
 */
function isAllowed (scopes, targetResource, targetRestrictions = {}) {

    return scopes.some(([scopeResource, methods, scopeRestrictions]) => {

        if (scopeResource !== targetResource) {
            return false;
        }

        return Object.entries(scopeRestrictions).every(
            ([scopeRestrictionName, scopeRestrictionValue]) =>
                isScopeRestrictionOK(scopeRestrictionName, scopeRestrictionValue, targetRestrictions)
        );
    });
}

module.exports = isAllowed;
