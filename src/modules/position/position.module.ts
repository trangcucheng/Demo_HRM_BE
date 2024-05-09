import { Module } from '@nestjs/common';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { PositionRepository } from '~/database/typeorm/repositories/position.repository';

@Module({
    controllers: [PositionController],
    providers: [PositionService, PositionRepository],
})
export class PositionModule {}
