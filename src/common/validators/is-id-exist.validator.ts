import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';
import { DatabaseService } from '~/database/typeorm/database.service';

@ValidatorConstraint({ name: 'IsIdExist', async: true })
@Injectable()
export class IsIdAlreadyExistConstraint implements ValidatorConstraintInterface {
    constructor(private readonly database: DatabaseService) {}

    async validate(id: number, args: ValidationArguments) {
        return !!(await this.database[args.constraints[0]?.entity]?.countBy({ id }));
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return `ID ${validationArguments?.value} không tồn tại`;
    }
}

export function IsIdExist(data: { entity: string }, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [data],
            validator: IsIdAlreadyExistConstraint,
        });
    };
}
