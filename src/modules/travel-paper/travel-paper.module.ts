import { Module } from '@nestjs/common';
import { TravelPaperController } from './travel-paper.controller';
import { TravelPaperService } from './travel-paper.service';

@Module({
    controllers: [TravelPaperController],
    providers: [TravelPaperService],
})
export class TravelPaperModule {}
