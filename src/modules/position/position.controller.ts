import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionService } from './position.service';

@ApiTags('Position')
@ApiBasicAuth('authorization')
@Controller('position')
export class PositionController {
    constructor(private readonly positionService: PositionService) { }

    @Permission('position:create')
    @Post()
    create(@Body() createPositionDto: CreatePositionDto) {
        return this.positionService.create(createPositionDto);
    }

    // @Permission('position:export')
    // @Get('export')
    // @ApiQuery({
    //     name: 'search',
    //     type: String,
    //     required: false,
    // })
    // export(@Query() queries) {
    //     return this.positionService.export({ ...queries });
    // }

    @Permission('position:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.positionService.findAll({ ...queries });
    }

    @Permission('position:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.positionService.findOne(+id);
    }

    @Permission('position:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updatePositionDto: UpdatePositionDto) {
        return this.positionService.update(+id, updatePositionDto);
    }

    @Permission('position:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.positionService.remove(+id);
    }
}
