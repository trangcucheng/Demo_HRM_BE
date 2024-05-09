import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftService } from './shift.service';

@ApiTags('Shift')
@ApiBasicAuth('authorization')
@Controller('shift')
export class ShiftController {
    constructor(private readonly shiftService: ShiftService) {}

    @Permission('shift:create')
    @Post()
    create(@Body() createShiftDto: CreateShiftDto) {
        return this.shiftService.create(createShiftDto);
    }

    @Permission('shift:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.shiftService.findAll({ ...queries });
    }

    @Permission('shift:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.shiftService.findOne(+id);
    }

    @Permission('shift:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateShiftDto: UpdateShiftDto) {
        return this.shiftService.update(+id, updateShiftDto);
    }

    @Permission('shift:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.shiftService.remove(+id);
    }
}
