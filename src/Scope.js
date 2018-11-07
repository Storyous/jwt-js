"use strict";
const Restriction = require('./Restriction');

class Scope {

    /**
     *
     * @param {string} resource
     * @param {Restriction[]} restrictions
     * @param {boolean} read
     * @param {boolean} write
     */
    constructor (resource, restrictions, read = true, write = false) {
        this._resource = resource;
        this._restrictions = restrictions;
        this._read = read;
        this._write = write;
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
     * @returns {boolean}
     */
    get read () {
        return this._read;
    }

    /**
     * @returns {boolean}
     */
    get write () {
        return this._write;
    }

    /**
     * @returns {[]}
     */
    toArray () {
        return [this.resource, this.permissions, this.formattedRestrictions];
    }

    /**
     * @returns {string}
     */
    get permissions () {
        let str = '';

        if (this.read) {
            str = `${str}r`;
        }

        if (this.write) {
            str = `${str}w`;
        }

        return str;
    }

    get formattedRestrictions () {
        return this.restrictions.reduce((formatted, restriction) => (
            Object.assign(formatted, { [restriction.field]: restriction.value })
        ), {});
    }

}

module.exports = Scope;
