import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('Product')
@ApiBasicAuth('authorization')
@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Permission('product:create')
    @Post()
    create(@Body() createProductDto: CreateProductDto) {
        return this.productService.create(createProductDto);
    }

    @Permission('product:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'categoryId', required: false, type: Number })
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    findAll(
        @Query() queries,
        @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId: string,
        @Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId: string,
    ) {
        return this.productService.findAll({ ...queries, categoryId, warehouseId });
    }

    @Permission('product:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.productService.findOne(+id);
    }

    @Permission('product:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateproductDto: UpdateProductDto) {
        return this.productService.update(+id, updateproductDto);
    }

    @Permission('product:delete')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.productService.remove(+id);
    }

    // @Permission('product:updateLimit')
    // @Patch(':id/limit')
    // updateLimit(@Param('id', ParseIntPipe) id: string, @Body() data: UpdateProductLimitDto) {
    //     return this.productService.updateLimit(+id, data);
    // }

    @Permission('product:createBarcode')
    @Post(':id/barcode')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                barcode: {
                    type: 'string',
                },
            },
        },
    })
    createBarcode(@Param('id', ParseIntPipe) id: string, @Body() data: { barcode: string }) {
        return this.productService.createBarcode(+id, data.barcode);
    }

    @Permission('product:findOne')
    @Get(':id/quantity')
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    quantity(@Param('id', ParseIntPipe) id: string, @Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId: string) {
        return this.productService.getQuantity(+id, +warehouseId);
    }
}
