import moment, { Moment } from 'moment';
import { ValueTransformer } from 'typeorm';

export class ColumnNumericTransformer implements ValueTransformer {
    private decimal: number;
    constructor(_decimal?: number | null) {
        this.decimal = _decimal;
    }

    to(data?: number | null): number | null {
        if (!isNullOrUndefined(data)) {
            return data;
        }
        return null;
    }

    from(data?: string | null): number | null {
        if (!isNullOrUndefined(data)) {
            const res = parseFloat(this.decimal ? parseFloat(data).toFixed(this.decimal) : data);
            if (isNaN(res)) {
                return null;
            } else {
                return res;
            }
        }
        return null;
    }
}

export class ColumnJsonTransformer implements ValueTransformer {
    constructor(private isString: boolean = false) {}

    to(data?: any | null): any | null {
        if (!isNullOrUndefined(data)) {
            return this.isString ? JSON.stringify(data) : data;
            // return data;
        }
        return null;
    }

    from(data?: string | null): any | null {
        if (!isNullOrUndefined(data)) {
            return this.isString ? JSON.parse(data) : JSON.parse(JSON.stringify(data));
        }
        return null;
    }
}

export enum DateType {
    DATE,
    DATETIME,
}

export class MomentTransformer implements ValueTransformer {
    constructor(private format: string = null, private type: DateType = DateType.DATETIME) {}

    private isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
        return typeof obj === 'undefined' || obj === null;
    }

    public from(value?: number | string | Date | null): Moment | undefined {
        if (this.isNullOrUndefined(value)) {
            return;
        }
        const calculatedMoment = this.format != null && this.format != undefined ? moment(value, this.format) : moment();

        switch (this.type) {
            case DateType.DATE:
                return calculatedMoment.startOf('day');
            case DateType.DATETIME:
            default:
                return calculatedMoment;
        }
    }

    public to(value?: Moment | null): Date | undefined {
        if (this.isNullOrUndefined(value)) {
            return;
        }
        return value.toDate();
    }
}

function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return typeof obj === 'undefined' || obj === null;
}

export class ColumnBooleanTransformer implements ValueTransformer {
    to(data?: boolean | null): boolean | null {
        if (!isNullOrUndefined(data)) {
            return data;
        }
        return null;
    }

    from(data?: number | null): boolean | null {
        if (!isNullOrUndefined(data)) {
            return !!data;
        }
        return null;
    }
}

export class ColumnArrayTransformer implements ValueTransformer {
    private arrayType: 'number' | 'string';
    private separator: string;
    constructor(_arrayType: 'number' | 'string', _separator: string = ',') {
        this.arrayType = _arrayType;
        this.separator = _separator;
    }

    to(data?: any[] | null): string | null {
        if (!isNullOrUndefined(data)) {
            return data.join(this.separator);
        }
        return null;
    }

    from(data?: string | null): any[] | null {
        if (!isNullOrUndefined(data)) {
            return data.split(this.separator).map((item) => {
                if (this.arrayType === 'number') {
                    return Number(item);
                } else {
                    return item;
                }
            });
        }
        return null;
    }
}
