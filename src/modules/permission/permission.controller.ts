import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { UtilService } from '~/shared/services';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionService } from './permission.service';

@ApiTags('Permission')
@ApiBasicAuth('authorization')
@Controller('permission')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService, private readonly utilService: UtilService) {}

    @Permission('permission:create')
    @Post()
    create(@Body() createPermissionDto: CreatePermissionDto) {
        return this.permissionService.create(createPermissionDto);
    }

    @Permission('permission:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'isGroup', required: false })
    findAll(@Query() queries, @Query('isGroup') isGroup: boolean) {
        return this.permissionService.findAll({ ...queries, isGroup });
    }

    @Permission('permission:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.permissionService.findOne(+id);
    }

    @Permission('permission:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
        return this.permissionService.update(+id, updatePermissionDto);
    }

    @Permission('permission:delete')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.permissionService.remove(+id);
    }
}
