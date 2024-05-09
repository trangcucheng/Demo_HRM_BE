import { Module } from '@nestjs/common';
import { ResignationLetterController } from './resignation-letter.controller';
import { ResignationLetterService } from './resignation-letter.service';

@Module({
    controllers: [ResignationLetterController],
    providers: [ResignationLetterService],
})
export class ResignationLetterModule {}
