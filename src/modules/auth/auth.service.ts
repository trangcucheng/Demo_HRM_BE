import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { TokenService, UtilService } from '@shared/services';
import { USER_STATUS } from '~/common/enums/enum';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { MailService } from '~/modules/mail/mail.service';
import { CacheService } from '~/shared/services/cache.service';

@Injectable()
export class AuthService {
    private readonly RESETPASSWORDTIMEOUT = 1800000; // miliseconds (30 mins)
    private readonly SECRETKEY = 'sYzB9UTkuLQ0d1DNPZabC4Q29iJ32xGX';
    private readonly INITVECTOR = '3dMYNoQo2CSYDpSD';
    private readonly SECRETSTRING = '6H2su82wAS85KowZ';

    constructor(
        private readonly tokenService: TokenService,
        private readonly mailService: MailService,
        private readonly utilService: UtilService,
        private readonly userRepository: UserRepository,
        private readonly accountRepository: AccountRepository,
        private readonly cacheService: CacheService,
    ) {}

    public async login(data: { username: string; password: string }) {
        const account = await this.accountRepository.findOne({
            select: ['id', 'username', 'password', 'secretToken', 'isActive'],
            where: {
                username: data.username,
            },
        });

        if (!account) {
            throw new UnauthorizedException('Wrong username or password');
        }

        if (!account.isActive) {
            throw new UnauthorizedException('User disabled');
        }

        if (!this.tokenService.isPasswordCorrect(data.password, account.password)) {
            throw new UnauthorizedException('Wrong username or password');
        }

        const secretToken = this.utilService.generateString();
        const tokenData = this.tokenService.createAuthToken({
            id: account.id,
            password: account.password,
            secretToken,
        });
        const refreshTokenData = this.tokenService.createRefreshToken({
            id: account.id,
            password: account.password,
            secretToken,
        });
        this.accountRepository.update(account.id, { secretToken });

        const user = await this.userRepository.findOne({
            where: { accountId: account.id, status: USER_STATUS.ACTIVE },
            relations: ['position', 'position.roles', 'position.roles.permissions'],
        });
        if (!user) throw new UnauthorizedException('User not found');

        this.cacheService.deletePattern(`account:${account.id}`);
        const { roles, permissions, position } = this.utilService.getPermissionsFromPosition(user.position);

        return {
            result: true,
            message: 'Login successfully',
            data: {
                id: account.id,
                session: tokenData.authToken,
                expired: tokenData.authTokenExpiresIn,
                refreshToken: refreshTokenData.refreshToken,
                position: {
                    ...position,
                    roles,
                },
                permissions,
            },
        };
    }

    public async logout(data: { session: string }) {
        const user = await this.tokenService.verifyAuthToken({ authToken: data.session });
        if (user.id) {
            const accountId = (await this.userRepository.findOneBy({ id: +user.id })).accountId;
            if (accountId) {
                this.accountRepository.update(accountId, { secretToken: null });
                this.cacheService.deletePattern(`account:${accountId}`);
            }
        }

        return {
            result: true,
            message: 'Success',
            data: null,
        };
    }

    public async forgotPassword(data: { email: string }) {
        try {
            if (!this.utilService.validateEmail(data.email)) {
                return {
                    result: false,
                    message: 'Email is invalid',
                    data: null,
                };
            }

            const user = await this.userRepository.findOne({
                select: ['email', 'fullName', 'status', 'account'],
                where: { email: data.email },
                relations: ['account'],
            });
            if (!user) {
                return {
                    result: false,
                    message: 'User not found',
                    data: null,
                };
            }

            if (user.status === USER_STATUS.DISABLED) {
                return {
                    result: false,
                    message: 'User disabled',
                    data: {
                        is_active: false,
                    },
                };
            }

            const encrypted = this.utilService.aesEncrypt({ email: user.email, password: user.account.password }, this.RESETPASSWORDTIMEOUT);
            const link = `${process.env.FE_URL}/reset-password?token=${encrypted}`;
            // gửi mail link reset password cho user
            this.mailService.sendForgotPassword({
                emailTo: user.email,
                subject: 'Reset your password',
                name: user.fullName,
                link: link,
            });

            return {
                result: true,
                message: 'Reset-password link has been sent to your email',
                data: null,
            };
        } catch (err) {
            throw new InternalServerErrorException({
                result: false,
                message: 'Forgot password error',
                data: null,
                statusCode: 500,
            });
        }
    }

    public async resetPassword(data: { token: string; password: string }) {
        try {
            const validateToken = this.validateToken(data.token);
            if (!validateToken.result) {
                return {
                    result: false,
                    message: 'Token invalid',
                    data: null,
                };
            }

            const email = validateToken.email;
            const password = validateToken.password;
            const user = await this.userRepository.findOne({
                select: ['id', 'account'],
                where: { email: email },
                relations: ['account'],
            });
            if (!user) {
                return {
                    result: false,
                    message: 'User not found',
                    data: null,
                };
            }

            if (user.account.password !== password) {
                return {
                    result: false,
                    message: 'Token expired',
                    data: null,
                };
            }

            const { salt, hash } = this.tokenService.hashPassword(data.password);
            const res = await this.accountRepository.update(user.account.id, {
                password: hash,
                salt,
            });

            return {
                result: res.affected > 0,
                message: res.affected > 0 ? 'Password reset successfully' : 'Cannot reset password',
                data: null,
            };
        } catch (err) {
            throw new InternalServerErrorException({
                result: false,
                message: 'Reset password error',
                data: null,
                statusCode: 500,
            });
        }
    }

    public async renewAuthToken(data: { refreshToken }) {
        const refreshTokenData = this.tokenService.verifyRefreshToken({ refreshToken: data.refreshToken });
        if (!refreshTokenData) {
            return {
                session: null,
                refreshToken: null,
            };
        }

        const authTokenData = this.tokenService.createAuthToken({
            id: refreshTokenData.id,
            password: refreshTokenData.password,
            secretToken: refreshTokenData.secretToken,
        }).authToken;

        const newRefreshTokenData = this.tokenService.createRefreshToken({
            id: refreshTokenData.id,
            password: refreshTokenData.password,
            secretToken: refreshTokenData.secretToken,
        });

        return {
            session: authTokenData,
            refreshToken: newRefreshTokenData.refreshToken,
        };
    }

    private validateToken(token: string) {
        const decrypted = this.utilService.aesDecrypt(token);
        if (!decrypted) return { result: false, email: null, password: null };
        return {
            result: true,
            email: decrypted.email,
            password: decrypted.password,
        };
    }
}
