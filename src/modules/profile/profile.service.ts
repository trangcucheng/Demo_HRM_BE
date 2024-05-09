import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { ChangePasswordDto } from '~/modules/profile/dto/changePassword.dto';
import { CacheService, TokenService, UtilService } from '~/shared/services';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly accountRepository: AccountRepository,
        private readonly tokenService: TokenService,
        private readonly utilService: UtilService,
        private readonly cacheService: CacheService,
        private readonly db: DatabaseService,
    ) {}

    async findOne(id: number) {
        const builder = this.userRepository.createQueryBuilder('user');
        builder.leftJoinAndSelect('user.position', 'position');
        builder.leftJoinAndSelect('position.roles', 'roles');
        builder.leftJoinAndSelect('roles.permissions', 'permissions');
        builder.leftJoinAndSelect('user.department', 'department');
        builder.where('user.id = :id', { id });
        const { position: positionData, ...user } = await builder.getOne();
        const { roles, permissions, position } = this.utilService.getPermissionsFromPosition(positionData);
        const isHighestPosition = await this.db.user.isHighestPosition(id);

        return {
            ...user,
            position: {
                ...position,
                isHighestPosition,
                roles,
            },
            permissions,
        };
    }

    update(id: number, updateProfileDto: UpdateProfileDto) {
        return this.userRepository.update(id, updateProfileDto);
    }

    async changePassword(id: number, updateProfileDto: ChangePasswordDto) {
        if (updateProfileDto.new_password !== updateProfileDto.confirm_password) {
            throw new BadRequestException('Mật khẩu mới không khớp');
        }

        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new BadRequestException('Không tìm thấy tài khoản');
        }

        const account = await this.accountRepository.findOneBy({ id: user.accountId });
        const isMatch = await this.tokenService.isPasswordCorrect(updateProfileDto.old_password, account.password);
        if (!isMatch) {
            throw new BadRequestException('Mật khẩu cũ không đúng');
        }

        const { salt, hash } = this.tokenService.hashPassword(updateProfileDto.new_password);
        const res = await this.accountRepository.update(
            { id: user.accountId },
            {
                password: hash,
                salt,
            },
        );

        return res;
    }
}
