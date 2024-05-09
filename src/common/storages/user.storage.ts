import { AsyncLocalStorage } from 'async_hooks';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

export const UserStorage = {
    storage: new AsyncLocalStorage<UserEntity>(),

    /**
     * Get user from storage
     * @returns UserEntity
     */
    get() {
        return this.storage.getStore();
    },

    /**
     * Set user to storage
     * @param user - UserEntity
     * @returns void
     */
    set(user: UserEntity) {
        return this.storage.enterWith(user);
    },

    /**
     * Get user id from storage
     * @returns number
     */
    getId(): number | undefined {
        return this.storage.getStore()?.id;
    },

    getLevel() {
        return this.storage.getStore()?.position?.level;
    },

    getDepartmentId() {
        return this.storage.getStore()?.departmentId;
    },

    getPositionId() {
        return this.storage.getStore()?.position?.id;
    },

    getPositionCode() {
        return this.storage.getStore()?.position?.code;
    },

    getPositionGroupId() {
        return this.storage.getStore()?.position?.positionGroupId;
    },

    getDepartmentIdAndPositionId() {
        const user = this.storage.getStore();
        return {
            departmentId: user?.departmentId,
            positionId: user?.position?.id,
        };
    },
};
