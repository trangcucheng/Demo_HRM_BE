import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractService } from './contract.service';

@ApiTags('Contract')
@ApiBasicAuth('authorization')
@Controller('contract')
export class ContractController {
    constructor(private readonly contractService: ContractService) {}

    @Permission('contract:create')
    @Post()
    create(@Body() createContractDto: CreateContractDto) {
        return this.contractService.create(createContractDto);
    }

    @Permission('contract:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.contractService.findAll({ ...queries });
    }

    @Permission('contract:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.contractService.findOne(+id);
    }

    @Permission('contract:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateContractDto: UpdateContractDto) {
        return this.contractService.update(+id, updateContractDto);
    }

    @Permission('contract:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.contractService.remove(+id);
    }
}
