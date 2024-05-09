import { HttpException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { FilterDto } from '~/common/dtos/filter.dto';
import { INVENTORY_HISTORY_TYPE } from '~/common/enums/enum';
import { UserStorage } from '~/common/storages/user.storage';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ImportGoodDto } from '~/modules/warehouse/dto/import-good.dto';
import { UpdateGoodDto } from '~/modules/warehouse/dto/update-good.dto';
import { UtilService } from '~/shared/services';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
    constructor(private readonly utilService: UtilService, private readonly database: DatabaseService) {}

    async create(createWarehouseDto: CreateWarehouseDto) {
        const entity = await this.database.warehouse.save(this.database.warehouse.create(createWarehouseDto));
        this.database.warehouse.update(entity.id, { parentPath: entity.id.toString() });

        return { result: true, message: 'Tạo kho thành công', data: entity };
    }

    async findAll(queries: FilterDto & { typeId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.warehouse, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ typeId: queries.typeId }));
        builder.andWhere(this.utilService.rawQuerySearch({ fields: ['name'], keyword: queries.search }));

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
        const builder = this.database.warehouse.createQueryBuilder('warehouse');
        builder.where('warehouse.id = :id', { id });
        builder.leftJoinAndSelect('warehouse.productCategories', 'productCategories');
        builder.leftJoinAndSelect('warehouse.department', 'department');
        builder.select([
            'warehouse',
            'productCategories.id',
            'productCategories.name',
            'productCategories.description',
            'department.id',
            'department.name',
        ]);
        return builder.getOne();
    }

    async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
        return this.database.warehouse.update(id, updateWarehouseDto);
    }

    remove(id: number) {
        return this.database.warehouse.delete(id);
    }

    async getProducts(queries: FilterDto & { warehouseId: number }) {
        const { builder, take, pagination } = this.utilService.getQueryBuilderAndPagination(this.database.inventory, queries);

        builder.andWhere(this.utilService.relationQuerySearch({ warehouseId: queries.warehouseId }));
        builder.andWhere(this.utilService.rawQuerySearch({ entityAlias: 'product', fields: ['name', 'code'], keyword: queries.search }));
        builder.leftJoinAndSelect('entity.product', 'product');
        builder.leftJoinAndSelect('product.unit', 'unit');
        builder.leftJoinAndSelect('product.category', 'category');
        builder.leftJoinAndSelect('product.quantityLimit', 'limit');
        builder.select([
            'entity',
            'product.id',
            'product.name',
            'product.code',
            'product.quantity',
            'unit.id',
            'unit.name',
            'category.id',
            'category.name',
            'limit.id',
            'limit.minQuantity',
            'limit.maxQuantity',
        ]);

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

    async importGoods(id: number, data: ImportGoodDto) {
        const warehouse = await this.database.warehouse.findOneBy({ id });
        if (!warehouse) {
            throw new HttpException('Kho không tồn tại', 400);
        }

        // check if product from category that belongs to warehouse
        const product = await this.database.product.findOne({ where: { id: data.productId }, relations: ['category', 'category.warehouse'] });
        if (!product) {
            throw new HttpException('Vật tư không tồn tại', 400);
        }

        if (!product.category) {
            throw new HttpException('Vật tư không thuộc danh mục nào', 400);
        }

        if (!product.category.warehouseId) {
            throw new HttpException(`Danh mục vật tư '${product.category.name}' không thuộc kho nào`, 400);
        }

        if (product.category.warehouseId !== id) {
            throw new HttpException(`Vật tư '${product.name}' không thể thêm vào kho '${warehouse.name}'`, 400);
        }

        const { expiredDate, ...rest } = data;
        let inventory = await this.database.inventory.findOne({ where: { warehouseId: id, productId: data.productId } });
        if (inventory) {
            this.database.inventory.update(inventory.id, {
                quantity: inventory.quantity + data.quantity,
                expiredAt: expiredDate ? moment(expiredDate).toDate() : null,
                notifyBefore: data.notifyBefore,
                notifyExpired: data.notifyExpired,
            });
            this.database.inventoryHistory.save(
                this.database.inventoryHistory.create({
                    inventoryId: inventory.id,
                    from: inventory.quantity,
                    to: inventory.quantity + data.quantity,
                    change: data.quantity,
                    updatedById: UserStorage.getId(),
                    type: INVENTORY_HISTORY_TYPE.IMPORT,
                }),
            );
        } else {
            inventory = await this.database.inventory.save(
                this.database.inventory.create({
                    ...rest,
                    expiredAt: expiredDate ? moment(expiredDate).toDate() : null,
                    notifyBefore: data.notifyBefore,
                    warehouseId: id,
                    createdById: UserStorage.getId(),
                    notifyExpired: data.notifyExpired,
                }),
            );
            this.database.inventoryHistory.save(
                this.database.inventoryHistory.create({
                    inventoryId: inventory.id,
                    from: 0,
                    to: data.quantity,
                    change: data.quantity,
                    updatedById: UserStorage.getId(),
                    type: INVENTORY_HISTORY_TYPE.IMPORT,
                }),
            );
        }

        this.utilService.notifyLimits([inventory]);

        return inventory;
    }

    async updateGood(warehouseId: number, inventoryId: number, data: UpdateGoodDto) {
        await this.utilService.checkRelationIdExist({ warehouse: warehouseId });

        const { expiredDate, ...rest } = data;
        const inventory = await this.database.inventory.findOneBy({ id: inventoryId });
        if (inventory) {
            this.database.inventory.update(inventoryId, {
                ...rest,
                expiredAt: expiredDate ? moment(expiredDate).toDate() : null,
                notifyBefore: data.notifyBefore,
                notifyExpired: data.notifyExpired,
            });
            // this.database.inventoryHistory.save(
            //     this.database.inventoryHistory.create({
            //         inventoryId: inventory.id,
            //         from: inventory.quantity,
            //         to: data.quantity,
            //         change: data.quantity - inventory.quantity,
            //         updatedById: UserStorage.getId(),
            //         type: INVENTORY_HISTORY_TYPE.UPDATE,
            //     }),
            // );
        }

        return inventory;
    }

    async importFromFile(warehouseId: number, fileId: number) {
        await this.utilService.checkRelationIdExist({ warehouse: warehouseId });
        const media = await this.database.media.findOneBy({ id: fileId });
        if (!media) {
            throw new HttpException('File không tồn tại', 400);
        }

        const schema = {
            'Tên vật tư': {
                prop: 'name',
                type: String,
            },
            Mã: {
                prop: 'code',
                type: String,
            },
            Đvt: {
                prop: 'unit',
                type: String,
            },
            'Loại vật tư': {
                prop: 'category',
                type: String,
            },
            'Mã nhóm mẹ': {
                prop: 'parent_code',
                type: String,
            },
            'Nhóm hàng': {
                prop: 'type',
                type: String,
            },
            g: {
                prop: 'prod',
                type: String,
            },
            h: {
                prop: 'dept',
                type: String,
            },
            ID: {
                prop: 'id',
                type: Number,
            },
        };
        const fileData = await this.utilService.readExcelFile(media.path, schema);
        // this.importProducts(warehouseId, fileData);
        return fileData;
    }

    private async findOrCreateProduct(productName: string, productCode: string, unitName: string, categoryName: string) {
        const unit = await this.database.unit.findOrCreate(unitName);
        const category = await this.database.productCategory.findOrCreate(categoryName);
        const product = await this.database.product.findOrCreate({ name: productName, code: productCode, unitId: unit.id, categoryId: category.id });

        return product;
    }

    private async importProducts(warehouseId: number, items: { name: string; code: string; unit: string; category: string }[]) {
        items.forEach(async (data) => {
            const product = await this.findOrCreateProduct(data.name, data.code, data.unit, data.category);
            const inventory = await this.database.inventory.findOne({ where: { warehouseId, productId: product.id } });
            if (inventory) {
                // this.database.inventory.update(inventory.id, {
                //     quantity: inventory.quantity + data.quantity,
                // });
                // this.database.inventoryHistory.save(
                //     this.database.inventoryHistory.create({
                //         inventoryId: inventory.id,
                //         from: inventory.quantity,
                //         to: inventory.quantity + data.quantity,
                //         change: data.quantity,
                //         updatedById: UserStorage.getId(),
                //         type: INVENTORY_HISTORY_TYPE.IMPORT,
                //     }),
                // );
            } else {
                this.database.inventory.save(
                    this.database.inventory.create({
                        ...data,
                        warehouseId: warehouseId,
                        productId: product.id,
                        createdById: UserStorage.getId(),
                    }),
                );
            }
        });
    }
}
