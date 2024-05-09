import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('Department')
@ApiBasicAuth('authorization')
@Controller('department')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}

    @Permission('department:create')
    @Post()
    create(@Body() createDepartmentDto: CreateDepartmentDto) {
        return this.departmentService.create(createDepartmentDto);
    }

    @Permission('department:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.departmentService.findAll({ ...queries });
    }

    @Permission('department:findAll')
    @Get('/list-tree')
    @ApiQuery({ type: FilterDto })
    getListTypeTree(@Query() queries) {
        return this.departmentService.getListTypeTree({ ...queries });
    }

    @Permission('department:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.departmentService.findOne(+id);
    }

    @Permission('department:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
        return this.departmentService.update(+id, updateDepartmentDto);
    }

    @Permission('department:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.departmentService.remove(+id);
    }
}
