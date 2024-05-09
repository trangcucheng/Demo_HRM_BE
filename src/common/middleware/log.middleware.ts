import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class LogMiddleware implements NestMiddleware {
    constructor(private database: DatabaseService, private utilService: UtilService) {}
    // eslint-disable-next-line @typescript-eslint/ban-types
    use(req: Request, res: Response, next: Function) {
        // const { ip, method, originalUrl } = req;
        // const userAgent = req.get('user-agent') || '';

        // res.on('finish', () => {
        //     const { statusCode } = res;
        //     Logger.log(`[${statusCode}] ${originalUrl}, ${method} - ${userAgent} - ${ip}`);
        // });

        next();
    }
}
