import { Module } from '@nestjs/common';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
    imports: [],
    controllers: [ProfileController],
    providers: [ProfileService, UserRepository, AccountRepository],
})
export class ProfileModule {}
