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
import { CreateFreeTimekeepingDto } from './dto/create-free-timekeeping.dto';
import { UpdateFreeTimekeepingDto } from './dto/update-free-timekeeping.dto';
import { FreeTimekeepingService } from './free-timekeeping.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('FreeTimekeeping')
@ApiBasicAuth('authorization')
@Controller('free-timekeeping')
export class FreeTimekeepingController {
    constructor(private readonly freeTimekeepingService: FreeTimekeepingService) {}

    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @Permission('freeTimekeeping:create')
    @Post()
    @UseInterceptors(FilesInterceptor('supportingDocuments', 10, multerOptions()))
    create(@Req() req, @UploadedFiles() files: Array<Express.Multer.File>, @Body() createFreeTimekeepingDto: CreateFreeTimekeepingDto) {
        return this.freeTimekeepingService.create(createFreeTimekeepingDto, files, req.user.id);
    }

    @Permission('freeTimekeeping:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.freeTimekeepingService.findAll({ ...queries });
    }

    @Permission('freeTimekeeping:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.freeTimekeepingService.findOne(+id);
    }

    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @Permission('freeTimekeeping:update')
    @Patch(':id')
    update(
        @Req() req,
        @Param('id', ParseIntPipe) id: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() updateFreeTimekeepingDto: UpdateFreeTimekeepingDto,
    ) {
        return this.freeTimekeepingService.update(+id, updateFreeTimekeepingDto, files, req.user.id);
    }

    @Permission('freeTimekeeping:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.freeTimekeepingService.remove(+id);
    }
}
