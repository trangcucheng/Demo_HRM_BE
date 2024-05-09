import { INestApplication } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

export function bootstrapLogging(app: INestApplication): void {
    app.useLogger(app.get(Logger));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());
}
