import { INestApplication } from '@nestjs/common';

export function bootstrapCors(app: INestApplication): void {
    app.enableCors();
}
