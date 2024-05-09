import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ForgotPasswordDto } from '~/modules/auth/dto/forgot-password.dto';
import { LoginDto } from '~/modules/auth/dto/login.dto';
import { RenewTokenDto } from '~/modules/auth/dto/renew-token.dto';
import { ResetPasswordDto } from '~/modules/auth/dto/reset-password.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    public async login(@Body() data: LoginDto) {
        return this.authService.login(data);
    }

    @ApiBasicAuth('authorization')
    @Post('logout')
    public async logout(@Req() req: Request) {
        const data = { session: req.headers['authorization'] };
        return this.authService.logout(data);
    }

    @Post('forgot-password')
    public async forgotPassword(@Body() data: ForgotPasswordDto) {
        return this.authService.forgotPassword(data);
    }

    @Post('reset-password')
    public async resetPassword(@Body() data: ResetPasswordDto) {
        return this.authService.resetPassword(data);
    }

    @Post('renew-token')
    public async renewToken(@Body() data: RenewTokenDto) {
        return this.authService.renewAuthToken(data);
    }
}
