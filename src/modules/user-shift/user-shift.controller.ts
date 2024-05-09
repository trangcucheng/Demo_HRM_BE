import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateUserShiftDto } from './dto/create-user-shift.dto';
import { UpdateUserShiftDto } from './dto/update-user-shift.dto';
import { UserShiftService } from './user-shift.service';

@ApiTags('UserShift')
@ApiBasicAuth('authorization')
@Controller('user-shift')
export class UserShiftController {
    constructor(private readonly userShiftService: UserShiftService) {}

    @Permission('userShift:create')
    @Post()
    create(@Body() createUserShiftDto: CreateUserShiftDto) {
        return this.userShiftService.create(createUserShiftDto);
    }

    @Permission('userShift:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.userShiftService.findAll({ ...queries });
    }

    @Permission('userShift:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.userShiftService.findOne(+id);
    }

    @Permission('userShift:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateUserShiftDto: UpdateUserShiftDto) {
        return this.userShiftService.update(+id, updateUserShiftDto);
    }

    @Permission('userShift:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.userShiftService.remove(+id);
    }

    @Permission('userShift:findOne')
    @Get(':id/users')
    getUsers(@Param('id', ParseIntPipe) id: string) {
        return this.userShiftService.getUsers(+id);
    }
}
