"use strict";

class Restriction {

    /**
     * @param {string} field
     * @param {number|string} value
     */
    constructor(field, value) {
        this._field = field;
        this._value = value;
    }

    /**
     * @returns {string}
     */
    get field() {
        return this._field;
    }

    /**
     * @returns {number|string}
     */
    get value() {
        return this._value;
    }
}


module.exports = Restriction;
