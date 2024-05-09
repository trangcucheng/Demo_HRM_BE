import { Global, Module } from '@nestjs/common';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { MailModule } from '~/modules/mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
    controllers: [AuthController],
    imports: [MailModule],
    providers: [AuthService, AccountRepository, UserRepository],
    exports: [AuthService],
})
export class AuthModule {}
