import { HttpException, Injectable } from '@nestjs/common';
import { FilterDto } from '~/common/dtos/filter.dto';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UpdateProductLimitDto } from '~/modules/product/dto/update-product-limit.dto';
import { UtilService } from '~/shared/services';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
    constructor(private readonly database: DatabaseService, private readonly utilService: UtilService) {}

    async create(createProductDto: CreateProductDto) {
        const { minQuantity, maxQuantity, ...rest } = createProductDto;
        const product = await this.database.product.save(this.database.product.create(rest));
        if ((minQuantity >= 0 || maxQuantity >= 0) && product.id) {
            await this.updateLimit(product.id, { minQuantity, maxQuantity });
        }

        return product;
    }

    async findAll(queries: FilterDto & { categoryId: number; warehouseId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.product, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ categoryId: queries.categoryId }));
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name', 'code', 'barcode'], keyword: queries.search }));

        builder.leftJoinAndSelect('entity.category', 'category');
        builder.leftJoinAndSelect('category.warehouse', 'warehouse');
        builder.leftJoinAndSelect('entity.unit', 'unit');
        builder.leftJoinAndSelect('entity.media', 'media');
        builder.leftJoinAndSelect('entity.quantityLimit', 'limit');
        builder.select([
            'entity',
            'category.id',
            'category.name',
            'warehouse.id',
            'warehouse.name',
            'media.id',
            'media.path',
            'unit.id',
            'unit.name',
            'limit.minQuantity',
            'limit.maxQuantity',
        ]);

        if (queries.warehouseId) {
            // check if category is in warehouse
            builder.andWhere('warehouse.id = :warehouseId', { warehouseId: queries.warehouseId });
        }

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
        const builder = this.database.product.createQueryBuilder('product');
        builder.where('product.id = :id', { id });
        builder.leftJoinAndSelect('product.category', 'category');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.leftJoinAndSelect('product.media', 'media');
        builder.leftJoinAndSelect('product.quantityLimit', 'limit');
        builder.leftJoinAndSelect('product.inventories', 'inventories');
        builder.leftJoinAndSelect('inventories.warehouse', 'warehouse');
        builder.select([
            'product',
            'category.id',
            'category.name',
            'media.id',
            'media.path',
            'unit.id',
            'unit.name',
            'limit.minQuantity',
            'limit.maxQuantity',
            'inventories.quantity',
            'inventories.errorQuantity',
            'inventories.expiredAt',
            'warehouse.id',
            'warehouse.name',
        ]);
        return builder.getOne();
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        const { minQuantity, maxQuantity, ...rest } = updateProductDto;
        if ((minQuantity >= 0 || maxQuantity >= 0) && id) {
            await this.updateLimit(id, { minQuantity, maxQuantity });
        }
        return this.database.product.update(id, rest);
    }

    async remove(id: number) {
        const isUsed = await this.isProductUsed(id);
        if (isUsed) {
            throw new HttpException('Sản phẩm đã được sử dụng trong các văn bản, không thể xóa', 400);
        }

        return this.database.product.delete(id);
    }

    async hardRemove(id: number) {
        await this.database.quantityLimit.delete({ productId: id });
        await this.database.inventory.delete({ productId: id });
        await this.database.orderItem.delete({ productId: id });
        await this.database.proposalDetail.delete({ productId: id });
        await this.database.repairDetail.delete({ replacementPartId: id });
        await this.database.stocktakeDetail.delete({ productId: id });
        await this.database.warehousingBillDetail.delete({ productId: id });
        return this.database.product.delete(id);
    }

    async createBarcode(id: number, barcode: string) {
        const product = await this.database.product.findOneBy({ id });
        if (!product) {
            throw new HttpException('Sản phẩm không tồn tại', 404);
        }

        return this.database.product.update(id, { barcode });
    }

    async getQuantity(id: number, warehouseId: number) {
        const inventory = await this.database.inventory.find({ where: { productId: id } });
        if (warehouseId) {
            const warehouseInventory = inventory.find((i) => i.warehouseId === warehouseId);
            return warehouseInventory?.quantity || 0;
        }

        return inventory.reduce((acc, cur) => acc + cur.quantity, 0);
    }

    private async updateLimit(id: number, data: UpdateProductLimitDto) {
        if (data.minQuantity > data.maxQuantity) {
            const tmp = data.minQuantity;
            data.minQuantity = data.maxQuantity;
            data.maxQuantity = tmp;
        }

        const limit = await this.database.quantityLimit.findOne({ where: { productId: id } });
        if (limit) {
            return this.database.quantityLimit.update(limit.id, { updatedById: UserStorage.getId(), ...data });
        } else {
            return this.database.quantityLimit.save(this.database.quantityLimit.create({ productId: id, createdById: UserStorage.getId(), ...data }));
        }
    }

    private async isProductUsed(id: number) {
        let count = await this.database.inventory.count({ where: { productId: id } });
        if (count) {
            return true;
        }

        count = await this.database.orderItem.count({ where: { productId: id } });
        if (count) {
            return true;
        }

        count = await this.database.proposalDetail.count({ where: { productId: id } });
        if (count) {
            return true;
        }

        count = await this.database.repairDetail.count({ where: { replacementPartId: id } });
        if (count) {
            return true;
        }

        count = await this.database.stocktakeDetail.count({ where: { productId: id } });
        if (count) {
            return true;
        }

        count = await this.database.warehousingBillDetail.count({ where: { productId: id } });
        if (count) {
            return true;
        }

        return false;
    }
}
