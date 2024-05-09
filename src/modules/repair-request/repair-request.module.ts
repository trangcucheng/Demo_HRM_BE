import { Module } from '@nestjs/common';
import { RepairRequestController } from './repair-request.controller';
import { RepairRequestService } from './repair-request.service';

@Module({
    controllers: [RepairRequestController],
    providers: [RepairRequestService],
})
export class RepairRequestModule {}
