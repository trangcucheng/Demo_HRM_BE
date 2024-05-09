import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserStorage } from '~/common/storages/user.storage';
import { UtilService } from '~/shared/services';
import { TokenService } from '../../shared/services/token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private tokenService: TokenService, private utilService: UtilService) {}

    async use(req: Request, res: Response, next) {
        try {
            if (!req.headers['authorization'] && !req.headers['passcode']) {
                throw new UnauthorizedException('Request Forbidden');
            }

            const authToken = req.headers['authorization'];
            const authData = await this.tokenService.verifyAuthToken({ authToken: authToken });

            if (authData.id === null) {
                throw new UnauthorizedException('Request Forbidden [Token Invalid]');
            }

            req.headers['_accountId'] = authData?.id;
            req.headers['_userId'] = authData?.user?.id?.toString();
            req.headers['_positionGroupId'] = authData?.user?.position?.positionGroupId?.toString();

            UserStorage.set(authData?.user);

            next();
        } catch (err) {
            throw new UnauthorizedException('Error: Request Forbidden [Token Invalid]');
        }
    }
}
