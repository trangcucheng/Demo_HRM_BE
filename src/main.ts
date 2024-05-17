import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import moment from 'moment-timezone';
import { join } from 'path';
import { AppModule } from '~/app.module';
import { bootstrapCors } from '~/bootstraps/cors.bootstrap';
import { bootstrapHelmet } from '~/bootstraps/helmet.bootstrap';
import { bootstrapInterceptor } from '~/bootstraps/interceptor.bootstrap';
import { bootstrapMoment } from '~/bootstraps/moment.bootstrap';
import { bootstrapSocket } from '~/bootstraps/socket.bootstrap';
import { bootstrapSwagger } from '~/bootstraps/swagger.bootstrap';
import { bootstrapValidation } from '~/bootstraps/validation.bootstrap';
import * as bodyParser from 'body-parser';

async function bootstrap() {
    /* SSl config */
    const keyPath = '../tintuc.me-ssl-bundle/private.key.pem'; // /etc/letsencrypt/live/[domain]/privkey.pem
    const certPath = '../tintuc.me-ssl-bundle/domain.cert.pem'; // /etc/letsencrypt/live/[domain]/fullchain.pem
    let httpsOptions;
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        httpsOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };
    }

    const app = await NestFactory.create<NestExpressApplication>(AppModule, { httpsOptions });

    /* app config */
    app.enableVersioning({ type: VersioningType.URI });
    app.useStaticAssets(join(process.cwd(), 'public'), {
        prefix: '/public/',
    });
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    /* boostrap */
    // bootstrapLogging(app);
    bootstrapSwagger(app, '1.0');
    bootstrapCors(app);
    bootstrapHelmet(app);
    bootstrapValidation(app);
    bootstrapSocket(app);
    bootstrapInterceptor(app);
    bootstrapMoment();

    app.listen(process.env.PORT)
        .then(() => {
            Logger.log(`Application is running on: ${process.env.PORT} at ${moment().format('YYYY-MM-DD HH:mm:ss')}`, 'NestApplication');
            app.getUrl().then((url) => {
                Logger.log(`Swagger is running on: ${url}/docs`, 'NestApplication');
            });
        })
        .catch((err) => {
            console.error(err);
        });
}

bootstrap();