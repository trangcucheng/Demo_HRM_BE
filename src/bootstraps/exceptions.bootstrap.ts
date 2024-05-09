import { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from '~/common/filters/exception.filter';
import { TypeOrmFilter } from '~/common/filters/typeorm.filter';

export function bootstrapExceptions(app: INestApplication): void {
    // const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(), new TypeOrmFilter());
}
