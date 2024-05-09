import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBasicAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '~/config/fileUpload.config';
import { TASK_STATUS } from '~/common/enums/enum';

@ApiTags('Task')
@ApiBasicAuth('authorization')
@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Permission('task:create')
    @Post()
    create(@Body() createTaskDto: CreateTaskDto) {
        return this.taskService.create(createTaskDto);
    }

    @Permission('task:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'status', required: false, enum: TASK_STATUS, isArray: true })
    @ApiQuery({ name: 'departmentIdOfHuman', required: false })
    findAll(@Query() queries, @Query('status') status: string, @Query('departmentIdOfHuman') departmentIdOfHuman: string) {
        return this.taskService.findAll({ ...queries, status, departmentIdOfHuman });
    }

    @Permission('task:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.taskService.findOne(+id);
    }

    @Permission('task:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.taskService.update(+id, updateTaskDto);
    }

    @Permission('task:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.taskService.remove(+id);
    }
}
