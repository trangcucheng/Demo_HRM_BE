import { Module } from '@nestjs/common';
import { MediaService } from '~/modules/media/media.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [],
    controllers: [UserController],
    providers: [UserService, MediaService],
})
export class UserModule {}
