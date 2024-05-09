import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
    constructor(private dataSource: DataSource) {
        super(UserEntity, dataSource.createEntityManager());
    }

    findOneUserWithAllRelationsById = (id: number) => {
        return this.findOne({
            where: { id: id },
            relations: ['position', 'account', 'department'],
        });
    };

    findOneWithRalations = ({ where, relations }: { where: any; relations: string[] }) => {
        const builder = this.createQueryBuilder('entity');
        if (where) {
            builder.where(where);
        }

        if (relations.length) {
            relations.forEach((relation) => {
                builder.leftJoinAndMapOne(`entity.${relation}`, `entity.${relation}`, relation, `${relation}.id = entity.${relation}Id`);
            });
        }

        return builder.getOne();
    };

    async getStatisBySex() {
        const result = this.query(`
            SELECT u.sex AS sex,
            COUNT(*) AS quantity
            FROM users u
            GROUP BY u.sex 
        `);

        return (await result).map((item) => ({
            sex: item.sex === 0 ? 'Nam' : 'Nữ',
            quantity: Number(item.quantity),
        }));
    }

    async getStatisBySeniority() {
        const result = this.query(`
            SELECT b.time1 AS seniority, 
            COUNT(*) AS quantity 
            FROM (SELECT a.user_id, 
                SUM(total_time) AS time1 
                FROM (SELECT contracts.user_id, 
                    IFNULL(YEAR(contracts.end_day) - YEAR(contracts.start_day), 
                    YEAR(CURDATE()) - YEAR(contracts.start_day)) AS total_time 
                    FROM contracts) AS a 
                    GROUP BY a.user_id) AS b 
                    GROUP BY b.time1;
        `);

        return (await result).map((item) => ({
            seniority: item.seniority,
            quantity: Number(item.quantity),
        }));
    }

    async getStatisByMonth(page: number, perPage: number, sortBy: string) {
        let query = `SELECT YEAR(DATE_SUB(NOW(), INTERVAL ${(page - 1) * perPage} MONTH)) AS year,
                        MONTH(DATE_SUB(NOW(), INTERVAL ${(page - 1) * perPage} MONTH)) AS month, 
                        COUNT(*) AS quantity
                        FROM contracts 
                            WHERE DATE_FORMAT(start_day, '%Y-%m-01')<=LAST_DAY(DATE_SUB(NOW(), INTERVAL ${(page - 1) * perPage} MONTH))
                            AND LAST_DAY(IFNULL(end_day, curdate()))>=DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ${
                                (page - 1) * perPage
                            } MONTH), '%Y-%m-01')`;

        for (let i = 1; i <= perPage; i++) {
            query += ` UNION SELECT YEAR(DATE_SUB(NOW(), INTERVAL ${i + (page - 1) * perPage} MONTH)) AS year,
                        MONTH(DATE_SUB(NOW(), INTERVAL ${i + (page - 1) * perPage} MONTH)) AS month, 
                        COUNT(*) AS quantity
                        FROM contracts 
                            WHERE DATE_FORMAT(start_day, '%Y-%m-01')<=LAST_DAY(DATE_SUB(NOW(), INTERVAL ${i + (page - 1) * perPage} MONTH))
                            AND LAST_DAY(IFNULL(end_day, curdate()))>=DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ${
                                i + (page - 1) * perPage
                            } MONTH), '%Y-%m-01')`;
        }

        const result = this.query(query);

        return (await result).map((item) => ({
            year: Number(item.year),
            month: Number(item.month),
            quantity: Number(item.quantity),
        }));
    }

    async getSuperiors(userId: number) {
        // const res = await this.query(`
        //     SELECT u.id
        //     FROM users as u, positions as p
        //     WHERE u.position_id = p.id
        //         AND p.level > (
        //             SELECT level
        //             FROM positions
        //             WHERE id = (SELECT position_id FROM users WHERE id = ${userId})
        //     );
        // `);

        return this.createQueryBuilder('entity')
            .innerJoin('entity.position', 'position')
            .where('position.level > (SELECT level FROM positions WHERE id = (SELECT position_id FROM users WHERE id = :userId))', {
                userId,
            })
            .getMany();
    }

    async isHighestPosition(userId: number) {
        const res = await this.createQueryBuilder('entity')
            .innerJoin('entity.position', 'position')
            .where('position.level = (SELECT MAX(level) FROM positions)')
            .andWhere('entity.id = :userId', { userId })
            .getOne();

        return !!res;
    }

    async getAllUserIds() {
        const result = this.query(`
            SELECT id
            FROM users
            WHERE status = 'ACTIVE'
        `);

        return (await result).map((item) => item.id);
    }

    async getAllUser(full_name: string) {
        const result = this.query(`
            SELECT *
            FROM users 
            ${full_name && `WHERE full_name LIKE '%${full_name}%'`}
        `);

        return (await result).map((item) => item);
    }

    async getUsersInDepartments(departmentIds: number[]) {
        const result = this.query(`
            SELECT id
            FROM users
            WHERE department_id IN (${departmentIds.join(',')})
        `);

        return (await result).map((item) => item.id);
    }

    // used for human resources
    async getAllUserIdsv2() {
        const result = this.query(`
            SELECT id
            FROM users
        `);

        return (await result).map((item) => item.id);
    }

    // used for human resources
    async getUsersInDepartmentsv2(departmentId: number) {
        const result = this.query(`
            SELECT id
            FROM users
            WHERE department_id = ${departmentId}
            OR department_id IN (SELECT id
                FROM departments
                WHERE parent_id = ${departmentId}
            )
        `);

        return (await result).map((item) => item.id);
    }

    // used for human resources
    async getHeadOfDepartment(departmentId?: number) {
        let result;
        if (departmentId) {
            result = this.query(`
            
        `);
        } else {
            result = this.query(`
            SELECT id
            FROM users
            INNER JOIN department ON department.headOfDepartment = user.id
            WHERE users 
        `);
        }

        return (await result).map((item) => item.id);
    }
}
