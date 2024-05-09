import { INestApplication } from '@nestjs/common';
import { TransformInterceptor } from '~/common/interceptors/transform.interceptor';

export function bootstrapInterceptor(app: INestApplication): void {
    app.useGlobalInterceptors(new TransformInterceptor());
}
