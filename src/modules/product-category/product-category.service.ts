import { Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoryService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    create(createProductCategoryDto: CreateProductCategoryDto) {
        return this.database.productCategory.save(this.database.productCategory.create(createProductCategoryDto));
    }

    async findAll(queries: FilterDto & { warehouseId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.productCategory, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ warehouseId: queries.warehouseId }));
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndSelect('warehouse.department', 'department');
        builder.select(['entity', 'warehouse.id', 'warehouse.name', 'department.id', 'department.name']);

        const [result, total] = await builder.getManyAndCount();
        const totalPages = Math.ceil(total / take);
        return {
            data: result,
            pagination: {
                ...pagination,
                totalRecords: total,
                totalPages: totalPages,
            },
        };
    }

    findOne(id: number) {
        const builder = this.database.productCategory.createQueryBuilder('entity');
        builder.leftJoinAndSelect('entity.warehouse', 'warehouse');
        builder.leftJoinAndSelect('warehouse.department', 'department');
        builder.where('entity.id = :id', { id });
        return builder.getOne();
    }

    update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
        return this.database.productCategory.update(id, updateProductCategoryDto);
    }

    remove(id: number) {
        this.database.product.update({ categoryId: id }, { categoryId: null });
        return this.database.productCategory.delete(id);
    }
}
