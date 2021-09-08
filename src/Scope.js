"use strict";
const Restriction = require('./Restriction');

class Scope {

    /**
     *
     * @param {string} resource
     * @param {Restriction[]} restrictions
     * @param {string} permissions
     */
    constructor (resource, restrictions, permissions) {
        this._resource = resource;
        this._restrictions = restrictions;
        this._permissions = permissions;
    }

    /**
     * @returns {string}
     */
    get resource () {
        return this._resource;
    }

    /**
     * @returns {Restriction[]}
     */
    get restrictions () {
        return this._restrictions;
    }

    /**
     * @returns {string}
     */
    get permissions () {
        return this._permissions;
    }

    /**
     * @returns {[]}
     */
    toArray () {
        return [this.resource, this.permissions, this.formattedRestrictions];
    }

    get formattedRestrictions () {
        return this.restrictions.reduce((formatted, restriction) => (
            Object.assign(formatted, { [restriction.field]: restriction.value })
        ), {});
    }

}

module.exports = Scope;
