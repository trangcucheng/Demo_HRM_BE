import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidationError, useContainer } from 'class-validator';
import { AppModule } from '~/app.module';

export function bootstrapValidation(app: INestApplication): void {
    // https://github.com/typestack/class-validator#using-service-container
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            // transformOptions: {
            //     // strategy: 'exposeAll',
            //     excludeExtraneousValues: true,
            //     enableImplicitConversion: true,
            // },
            // stopAtFirstError: false,
            // forbidUnknownValues: true,
            // disableErrorMessages: false,
            exceptionFactory: (validationErrors: ValidationError[] = []) => {
                return new BadRequestException(
                    validationErrors.map((error) => ({
                        field: error.property,
                        error: Object.values(error.constraints).join(', '),
                    })),
                );
            },
            // validationError: { target: true, value: true },
        }),
    );
}
