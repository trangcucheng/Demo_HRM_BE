import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBasicAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateTimeKeepingDto } from './dto/create-time-keeping.dto';
import { UpdateTimeKeepingDto } from './dto/update-time-keeping.dto';
import { TimeKeepingService } from './time-keeping.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('TimeKeeping')
@ApiBasicAuth('authorization')
@Controller('time-keeping')
export class TimeKeepingController {
    constructor(private readonly timeKeepingService: TimeKeepingService) {}

    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @Permission('timeKeeping:create')
    @Post()
    @UseInterceptors(FilesInterceptor('supportingDocuments', 10, multerOptions()))
    create(@Req() req, @Body() createTimeKeepingDto: CreateTimeKeepingDto, @UploadedFiles() files: Array<Express.Multer.File>) {
        return this.timeKeepingService.create(createTimeKeepingDto, files, req.user.id);
    }

    @Permission('timeKeeping:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.timeKeepingService.findAll({ ...queries });
    }

    @Permission('timeKeeping:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.timeKeepingService.findOne(+id);
    }

    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @Permission('timeKeeping:update')
    @Patch(':id')
    @UseInterceptors(FilesInterceptor('supportingDocuments', 10, multerOptions()))
    update(
        @Req() req,
        @Param('id', ParseIntPipe) id: string,
        @Body() updateTimeKeepingDto: UpdateTimeKeepingDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        return this.timeKeepingService.update(+id, updateTimeKeepingDto, files, req.user.id);
    }

    @Permission('timeKeeping:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.timeKeepingService.remove(+id);
    }
}
