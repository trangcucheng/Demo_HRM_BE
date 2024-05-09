import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { CacheService } from '~/shared/services/cache.service';
import { CronService } from '~/shared/services/cron.service';
import { TokenService } from '~/shared/services/token.service';
import { UtilService } from '~/shared/services/util.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
        }),
    ],
    providers: [UtilService, TokenService, CronService, CacheService, SchedulerRegistry, UserRepository, AccountRepository],
    exports: [UtilService, TokenService, CronService, CacheService],
})
export class ServicesModule {}
