import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';

export function bootstrapSwagger(app: INestApplication, appVersion: string): void {
    if (process.env.NODE_ENV === 'development') {
        const config = new DocumentBuilder()
            .setTitle(`${process.env.APP_NAME} Swagger`)
            .setDescription(`The ${process.env.APP_NAME} API documents`)
            .setVersion(appVersion)
            .addApiKey(
                {
                    type: 'apiKey',
                },
                'authorization',
            )
            .setLicense('RSRM.dev', 'https://rsrm.dev')
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('docs', app, document, {
            swaggerOptions: {
                tagsSorter: 'alpha',
                // operationsSorter: 'alpha',
                persistAuthorization: true,
                docExpansion: 'none',
            },
        });

        writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));
    }
}
