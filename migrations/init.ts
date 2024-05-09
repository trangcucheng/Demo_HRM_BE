import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1702838105325 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`
        //     CREATE TABLE accounts (
        //         created_at timestamp(6) NOT NULL DEFAULT current_timestamp(6),
        //         updated_at timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
        //         deleted_at timestamp(6) NULL DEFAULT NULL,
        //         id int(10) unsigned NOT NULL AUTO_INCREMENT,
        //         username varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        //         password varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
        //         salt varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
        //         secret_token varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
        //         is_active tinyint(4) DEFAULT 1,
        //         PRIMARY KEY (id)
        //     ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        // `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
