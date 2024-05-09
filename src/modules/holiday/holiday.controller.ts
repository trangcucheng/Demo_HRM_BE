import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { HolidayService } from './holiday.service';

@ApiTags('Holiday')
@ApiBasicAuth('authorization')
@Controller('holiday')
export class HolidayController {
    constructor(private readonly holidayService: HolidayService) {}

    @Permission('holiday:create')
    @Post()
    create(@Body() createHolidayDto: CreateHolidayDto) {
        return this.holidayService.create(createHolidayDto);
    }

    @Permission('holiday:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.holidayService.findAll({ ...queries });
    }

    @Permission('holiday:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.holidayService.findOne(+id);
    }

    @Permission('holiday:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateHolidayDto: UpdateHolidayDto) {
        return this.holidayService.update(+id, updateHolidayDto);
    }

    @Permission('holiday:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.holidayService.remove(+id);
    }
}
