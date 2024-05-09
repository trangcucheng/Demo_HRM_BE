import { CalendarService } from './../calendar/calendar.service';
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
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBasicAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateHumanDto } from './dto/create-human.dto';
import { UpdateHumanDto } from './dto/update-human.dto';
import { HumanService } from './human.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';
import { HUMAN_DASHBOARD_TYPE } from '~/common/enums/enum';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Human')
@ApiBasicAuth('authorization')
@Controller('human')
export class HumanController {
    constructor(private readonly humanService: HumanService, private readonly calendarService: CalendarService) {}

    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @Permission('human:create')
    @Post()
    @UseInterceptors(FileInterceptor('avatar', multerOptions()))
    create(@Body() createHumanDto: CreateHumanDto, @UploadedFile() avatar: Express.Multer.File) {
        return this.humanService.create(createHumanDto, avatar);
    }

    @Permission('human:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.humanService.findAll({ ...queries });
    }

    @Permission('human:findAll')
    @Get('by-position-group-id')
    @ApiQuery({ type: FilterDto })
    findAllByPositionGroup(@Req() req: Request, @Query() queries) {
        return this.humanService.findAllByPositionGroup({ ...queries }, req);
    }

    @Permission('human:findAll')
    @Get('by-department')
    @ApiQuery({ type: FilterDto })
    findAllByDepartment(@Req() req: Request, @Query() queries) {
        return this.humanService.findAllByDepartment({ ...queries }, req);
    }

    @Permission('human:findAll')
    @Get('by-is-manager')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({
        name: 'isManager',
        type: Number,
        description: 'Có phải là quản lý không? 1: phải, 0: không phải',
        required: true,
    })
    findAllByIsManager(@Query() queries, @Query('isManager', new ParseIntPipe({ optional: true })) isManager: string) {
        return this.humanService.findAllByIsManager({ ...queries, isManager });
    }

    @Permission('human:dashboard')
    @Get('dashboard')
    @ApiQuery({ type: FilterDto })
    @ApiQuery({
        name: 'type',
        enum: HUMAN_DASHBOARD_TYPE,
        description: 'SEX: Theo giới tính, SENIORITY: Thâm niên, BY_MONTH: Tình hình biến động theo tháng',
        required: true,
    })
    dashboard(@Query() queries, @Query('type') type: string) {
        return this.humanService.dashboard(queries, type);
    }

    @UseGuards(AuthGuard)
    @Permission('calendar:findAll')
    @Get('calendar')
    findAllCalendarByUserLogin(@Query() queries) {
        return this.calendarService.findAllByUserLogin({ ...queries });
    }

    @Permission('human:export')
    @Get('export')
    export(@Res() res) {
        return this.humanService.export(res);
    }

    @Permission('human:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.humanService.findOne(+id);
    }

    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @Permission('human:update')
    @Patch(':id')
    @UseInterceptors(FileInterceptor('avatar', multerOptions()))
    update(@Param('id', ParseIntPipe) id: string, @Body() updateHumanDto: UpdateHumanDto, @UploadedFile() avatar: Express.Multer.File) {
        return this.humanService.update(+id, updateHumanDto, avatar);
    }

    @Permission('human:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.humanService.remove(+id);
    }

    // @UseGuards(AuthGuard)
    // @Permission('calendar:update')
    // @Patch('calendar/:id')
    // updateCalendar(@Param('id', ParseIntPipe) id: string, @Body() updateCalendarDto: UpdateCalendarDto) {
    //     return this.calendarService.update(+id, updateCalendarDto);
    // }
}
