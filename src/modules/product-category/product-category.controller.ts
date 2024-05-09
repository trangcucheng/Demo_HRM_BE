import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ProductCategoryService } from './product-category.service';

@ApiTags('Product Category')
@ApiBasicAuth('authorization')
@Controller('product-category')
export class ProductCategoryController {
    constructor(private readonly productCategoryService: ProductCategoryService) {}

    @Permission('productCategory:create')
    @Post()
    create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
        return this.productCategoryService.create(createProductCategoryDto);
    }

    @Permission('productCategory:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'warehouseId', required: false, type: Number })
    findAll(@Query() queries, @Query('warehouseId', new ParseIntPipe({ optional: true })) warehouseId: string) {
        return this.productCategoryService.findAll({ ...queries, warehouseId });
    }

    @Permission('productCategory:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.productCategoryService.findOne(+id);
    }

    @Permission('productCategory:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateProductCategoryDto: UpdateProductCategoryDto) {
        return this.productCategoryService.update(+id, updateProductCategoryDto);
    }

    @Permission('productCategory:delete')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.productCategoryService.remove(+id);
    }
}
