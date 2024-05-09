import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export function bootstrapHelmet(app: INestApplication): void {
    if (process.env.NODE_ENV === 'production') {
        app.use(helmet());
    }
}
