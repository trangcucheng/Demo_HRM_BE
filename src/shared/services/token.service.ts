import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { CACHE_TIME } from '~/common/enums/enum';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { CacheService } from '~/shared/services/cache.service';
import { UtilService } from '~/shared/services/util.service';

@Injectable()
export class TokenService {
    constructor(
        private configService: ConfigService,
        private readonly accountRepository: AccountRepository,
        private readonly utilService: UtilService,
        private readonly cacheService: CacheService,
    ) {
        //
    }

    /* AUTH TOKEN */
    public createAuthToken(data: { id: number; password: string; secretToken: string }) {
        try {
            const head = this.utilService.generateString(8);
            const tail = this.utilService.generateString(8);
            const { id, secretToken } = data;
            const password = `${head}${data.password}${tail}`;
            const { authTokenSecret, authTokenName, authExpiresIn } = this.configService.get('token');
            const exp = Math.floor(Date.now() / 1000) + authExpiresIn; // authExpiresIn: seconds
            const payload = {
                exp,
                id,
                password,
                authTokenName,
                secretToken,
            };

            const authToken = jwt.sign(payload, authTokenSecret);
            const authTokenExpiresIn = exp;

            return { authToken, authTokenExpiresIn };
        } catch (err) {
            console.log('createAuthToken error', err);
            throw new HttpException('Unable to create authToken', 500);
        }
    }

    // verify the auth token, return usereID
    public async verifyAuthToken(data: { authToken: string }): Promise<{ id: string; user: UserEntity }> {
        try {
            if (!data.authToken) return { id: null, user: null };

            const { authToken } = data;
            const jwtRegex = /(^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/;
            const res = { id: null, user: null };
            if (RegExp(jwtRegex).exec(authToken)) {
                const { authTokenName, tokenData } = await this.getTokentData(authToken);
                const password = tokenData.password.slice(8, tokenData.password.length - 8);
                const account = await this.getAccount(tokenData.id);
                if (account?.password !== password) return res;
                // secretToken is used to invalidate all tokens when user logins from another device
                if (process.env.LOGIN_SINGLE_DEVICE === 'true' && tokenData.secretToken && account?.secretToken !== tokenData.secretToken) return res;
                if (account && authTokenName === tokenData.authTokenName) {
                    res.id = account.id;
                    res.user = account.user;
                }
            }

            return res;
        } catch (err) {
            console.log('verifyAuthToken error', err);
            return { id: null, user: null };
        }
    }

    private async getAccount(id: number) {
        const key = `account:${id}`;
        const cached = await this.cacheService.getJson(key);
        if (cached) return cached;

        const account = await this.accountRepository.findOne({
            select: ['id', 'password', 'secretToken'],
            where: { id: id },
            relations: ['user', 'user.position', 'user.position.roles'],
        });

        this.cacheService.setJson(key, account, CACHE_TIME.ONE_HOUR);
        this.cacheService.setJson(`userData:${account?.user?.id}`, account?.user, CACHE_TIME.ONE_WEEK);
        return account;
    }

    private async getTokentData(authToken: string) {
        const cacheKey = `tokenData:${authToken}`;
        const tokenDataCached = await this.cacheService.getJson(cacheKey);
        if (tokenDataCached) return tokenDataCached;

        const { authTokenSecret, authTokenName } = this.configService.get('token');
        const tokenData = jwt.verify(authToken, authTokenSecret);
        const res = {
            tokenData: {
                id: tokenData.id,
                password: tokenData.password,
                secretToken: tokenData.secretToken,
                authTokenName: tokenData.authTokenName,
            },
            authTokenName,
        };

        this.cacheService.setJson(cacheKey, res, CACHE_TIME.THIRTY_MINUTES);
        return res;
    }
    /* AUTH TOKEN */

    /* REFRESH TOKEN */
    public createRefreshToken(data: { id: number; password: string; secretToken: string }) {
        try {
            const head = this.utilService.generateString(8);
            const tail = this.utilService.generateString(8);
            const { id, secretToken } = data;
            const password = `${head}${data.password}${tail}`;
            const { refreshTokenSecret, refreshTokenName, refreshExpiresIn } = this.configService.get('token');
            const exp = Math.floor(Date.now() / 1000) + refreshExpiresIn; // authExpiresIn: seconds

            const payload = {
                exp,
                id,
                password,
                refreshTokenName,
                secretToken,
            };

            const refreshToken = jwt.sign(payload, refreshTokenSecret);
            const refreshTokenExpiresIn = exp;

            return { refreshToken, refreshTokenExpiresIn };
        } catch (err) {
            console.log('createRefreshToken error', err);
            throw new Error('createRefreshToken error');
        }
    }

    public verifyRefreshToken(data: { refreshToken: string }) {
        try {
            const { refreshToken } = data;
            const { refreshTokenSecret, refreshTokenName } = this.configService.get('token');
            const tokenData: any = jwt.verify(refreshToken, refreshTokenSecret);

            console.log('Verify refresh token data', tokenData);

            if (refreshTokenName === tokenData.refreshTokenName) {
                tokenData.password = tokenData.password.slice(8, tokenData.password.length - 8);
                return tokenData;
            }

            return null;
        } catch (err) {
            console.log('verifyRefreshToken error', err);
            return null;
        }
    }
    /* REFRESH TOKEN */

    public validateUrl(url: string): string {
        const removedQuery = url.split('?');
        const arr = removedQuery[0].split('/');
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] && (!isNaN(+arr[i]) || arr[i].includes('0_'))) {
                arr[i] = ':id';
            }
        }
        return arr.join('/');
    }

    public static sha1(str: string) {
        const shasum = createHash('sha1');
        shasum.update(str);
        return shasum.digest('hex');
    }

    hashPassword(password: string) {
        const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS) || 8);
        const hash = bcrypt.hashSync(password, salt);

        return { salt, hash };
    }

    isPasswordCorrect(plainPassword: string, hash: string) {
        return bcrypt.compareSync(plainPassword, hash);
    }
}
