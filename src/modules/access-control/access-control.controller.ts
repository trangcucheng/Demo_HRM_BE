import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ONLY_ADMIN } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { AccessControlService } from './access-control.service';
import { CreateAccessControlDto } from './dto/create-access-control.dto';
import { UpdateAccessControlDto } from './dto/update-access-control.dto';

@ApiTags('AccessControl')
@ApiBasicAuth('authorization')
@Controller('access-control')
export class AccessControlController {
    constructor(private readonly accessControlService: AccessControlService) {}

    @Permission(ONLY_ADMIN)
    @Post()
    create(@Body() createAccessControlDto: CreateAccessControlDto) {
        return this.accessControlService.create(createAccessControlDto);
    }

    @Permission(ONLY_ADMIN)
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'entity', required: false })
    @ApiQuery({ name: 'departmentId', required: false })
    @ApiQuery({ name: 'positionId', required: false })
    @ApiQuery({ name: 'positionGroupId', required: false })
    findAll(
        @Query() queries,
        @Query('entity') entity: string,
        @Query('departmentId') departmentId: string,
        @Query('positionId') positionId: string,
        @Query('positionGroupId') positionGroupId: string,
    ) {
        return this.accessControlService.findAll({ ...queries, entity, departmentId, positionId, positionGroupId });
    }

    @Permission(ONLY_ADMIN)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.accessControlService.findOne(+id);
    }

    @Permission(ONLY_ADMIN)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateAccessControlDto: UpdateAccessControlDto) {
        return this.accessControlService.update(+id, updateAccessControlDto);
    }

    @Permission(ONLY_ADMIN)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.accessControlService.remove(+id);
    }
}
