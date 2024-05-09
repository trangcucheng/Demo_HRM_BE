import { Module } from '@nestjs/common';
import { ConfirmPortalController } from './confirm-portal.controller';
import { ConfirmPortalService } from './confirm-portal.service';

@Module({
    controllers: [ConfirmPortalController],
    providers: [ConfirmPortalService],
})
export class ConfirmPortalModule {}
