import { Module } from '@nestjs/common';
import { PositionGroupController } from './position-group.controller';
import { PositionGroupService } from './position-group.service';

@Module({
    controllers: [PositionGroupController],
    providers: [PositionGroupService],
})
export class PositionGroupModule {}
