import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitService } from './unit.service';

@ApiTags('Unit')
@ApiBasicAuth('authorization')
@Controller('unit')
export class UnitController {
    constructor(private readonly unitService: UnitService) {}

    @Permission('unit:create')
    @Post()
    create(@Body() createUnitDto: CreateUnitDto) {
        return this.unitService.create(createUnitDto);
    }

    @Permission('unit:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.unitService.findAll({ ...queries });
    }

    @Permission('unit:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.unitService.findOne(+id);
    }

    @Permission('unit:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateUnitDto: UpdateUnitDto) {
        return this.unitService.update(+id, updateUnitDto);
    }

    @Permission('unit:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.unitService.remove(+id);
    }
}
