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
    constructor(resource, restrictions, read = true, write = false) {
        this._resource = resource;
        this._restrictions = restrictions;
        this._read = read;
        this._write = write;
    }

    /**
     * @returns {string}
     */
    get resource() {
        return this._resource;
    }

    /**
     * @returns {Restriction[]}
     */
    get restrictions() {
        return this._restrictions;
    }

    /**
     * @returns {boolean}
     */
    get read() {
        return this._read;
    }

    /**
     * @returns {boolean}
     */
    get write() {
        return this._write;
    }

    /**
     * @returns {[]}
     */
    toArray() {
        return [this.resource, this.permissions, this.formattedRestrictions];
    }

    /**
     *
     * @param array
     * @returns {Scope}
     */
    static fromArray(array) {
        const restrictions = Object.entries(array[2]).map(([field, value]) => {
            return new Restriction(field, value)
        });
        return new Scope(array[0], restrictions, array[1].includes('r'), array[1].includes('w'))
    }

    /**
     * @returns {string}
     */
    get permissions() {
        let str = '';

        if (this.read) {
            str = 'r';
        }

        if(this.write) {
            str = `${str}w`;
        }

        return str;
    }

    get formattedRestrictions() {
        const restrictions = {};
        this.restrictions.forEach((restriction) => {
            restrictions[restriction.field] = restriction.value;
        });

        return restrictions;
    }

}

module.exports = Scope;
