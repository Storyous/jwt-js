"use strict";

export class Restriction {
    private _field: string;
    private _value: number | string | (number | string)[];

    constructor(field: string, value: number | string | (number | string)[]) {
        this._field = field;
        this._value = value;
    }

    get field(): string {
        return this._field;
    }

    get value(): number | string | (number | string)[] {
        return this._value;
    }
}

