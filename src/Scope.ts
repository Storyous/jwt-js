import { Restriction } from './Restriction';

export interface FormattedRestrictions {
    [key: string]: number | string | (number | string)[];
}

export class Scope {
    private _resource: string;
    private _restrictions: Restriction[];
    private _permissions: string;

    constructor(resource: string, restrictions: Restriction[], permissions: string) {
        this._resource = resource;
        this._restrictions = restrictions;
        this._permissions = permissions;
    }

    get resource(): string {
        return this._resource;
    }

    get restrictions(): Restriction[] {
        return this._restrictions;
    }

    get permissions(): string {
        return this._permissions;
    }

    toArray(): [string, string, FormattedRestrictions] {
        return [this.resource, this.permissions, this.formattedRestrictions];
    }

    get formattedRestrictions(): FormattedRestrictions {
        return this.restrictions.reduce((formatted: FormattedRestrictions, restriction: Restriction) => {
            formatted[restriction.field] = restriction.value;
            return formatted;
        }, {});
    }
}

