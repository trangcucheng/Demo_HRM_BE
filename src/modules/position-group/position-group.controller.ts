import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreatePositionGroupDto } from './dto/create-position-group.dto';
import { UpdatePositionGroupDto } from './dto/update-position-group.dto';
import { PositionGroupService } from './position-group.service';

@ApiTags('PositionGroup')
@ApiBasicAuth('authorization')
@Controller('position-group')
export class PositionGroupController {
    constructor(private readonly positionGroupService: PositionGroupService) {}

    @Permission('positionGroup:create')
    @Post()
    create(@Body() createPositionGroupDto: CreatePositionGroupDto) {
        return this.positionGroupService.create(createPositionGroupDto);
    }

    @Permission('positionGroup:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.positionGroupService.findAll({ ...queries });
    }

    @Permission('positionGroup:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.positionGroupService.findOne(+id);
    }

    @Permission('positionGroup:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updatePositionGroupDto: UpdatePositionGroupDto) {
        return this.positionGroupService.update(+id, updatePositionGroupDto);
    }

    @Permission('positionGroup:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.positionGroupService.remove(+id);
    }
}
