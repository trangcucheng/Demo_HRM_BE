/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { PERMISSION_KEY } from '~/common/decorators/permission.decorator';
import { CACHE_TIME, USER_ROLE } from '~/common/enums/enum';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { CacheService } from '~/shared/services/cache.service';

const URLs = ['auth', 'docs'];

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private dataSource: DataSource,
        private readonly cacheService: CacheService,
        private readonly db: DatabaseService,
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        if (URLs.some((url) => req.originalUrl.includes(url))) return true;
        const permissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);
        if (!permissions || permissions.length < 1) return false;

        return this.verifyPermission({
            req: req,
            permissions: permissions,
            params: req.params,
        });
    }

    private async verifyPermission(data: { req: Request; permissions: string[]; params: any }) {
        try {
            if (data.permissions.length === 0) return false;
            if (data.permissions.includes(BYPASS_PERMISSION)) return true;

            const userId = data.req.headers['_userId'];
            const user = await this.getUser(+userId || 0);
            if (!user) return false;

            // if user is admin
            const roleIds = user.position?.roles?.map((r) => r.id);
            if (roleIds?.includes(USER_ROLE.ADMIN)) {
                data.req.headers['_roleIds'] = roleIds.join(',');
                data.req.headers['_positionId'] = user.positionId.toString();
                data.req.headers['_fullName'] = user.fullName;
                return true;
            }

            const permissions = await this.getPermissions(user.positionId);
            if (permissions.length === 0) return false;
            // check if permission is in permissions
            if (!permissions.some((p) => data.permissions.includes(p))) return false;

            data.req.headers['_roleIds'] = roleIds?.join(',');
            data.req.headers['_positionId'] = user.positionId.toString();
            data.req.headers['_fullName'] = user.fullName;

            return true;
        } catch (error) {
            console.log('LOG:: error:', error.stack);
            console.log('LOG:: PermissionGuard:', error.message);
            return false;
        }
    }

    private async getPermissions(positionId: number) {
        const key = `permissions:${positionId}`;
        const cached = await this.cacheService.getJson(key);
        if (cached) return cached;

        const permissions = await this.db.permission.query(`
            SELECT p.action
            FROM roles_permissions as rp, permissions as p
            WHERE rp.role_id IN (SELECT role_id FROM roles_positions WHERE position_id = ${positionId})
                AND rp.permission_id = p.id
        `);

        this.cacheService.setJson(
            key,
            permissions?.map((p) => p.action),
            CACHE_TIME.ONE_MONTH,
        );

        return permissions?.map((p) => p.action);
    }

    private async getUser(id: number): Promise<UserEntity> {
        const key = `userData:${id}`;
        const cached = await this.cacheService.getJson(key);
        if (cached) return cached;

        const builder = this.db.user.createQueryBuilder('user');
        builder.where('user.id = :id', { id: id });
        builder.leftJoinAndSelect('user.position', 'position');
        builder.leftJoinAndSelect('position.roles', 'roles');
        builder.select([
            'user.id',
            'user.positionId',
            'user.fullName',
            'roles.id',
            'roles.name',
            'position.id',
            'position.name',
            'roles.id',
            'roles.name',
        ]);
        const user = await builder.getOne();
        return user;
    }
}
