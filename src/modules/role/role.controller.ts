import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { UtilService } from '~/shared/services';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';

@ApiTags('Role')
@ApiBasicAuth('authorization')
@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService, private readonly utilService: UtilService) {}

    @Permission('role:create')
    @Post()
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto);
    }

    @Permission('role:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.roleService.findAll({ ...queries });
    }

    @Permission('role:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.roleService.findOne(+id);
    }

    @Permission('role:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.roleService.update(+id, updateRoleDto);
    }

    @Permission('role:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.roleService.remove(+id);
    }
}
