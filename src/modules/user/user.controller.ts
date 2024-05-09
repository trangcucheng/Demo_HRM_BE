import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBasicAuth('authorization')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Permission('user:create')
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Permission('user:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.userService.findAll({ ...queries });
    }

    @Permission('user:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.userService.findOne(+id);
    }

    @Permission('user:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @Permission('user:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.userService.remove(+id);
    }
}
