import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from 'nestjs-redis';
import databaseConfig from '~/config/database.config';
import redis from '~/config/redis.config';
import token from '~/config/token.config';
import { DatabaseModule } from '~/database/typeorm';
import { DatabaseService } from '~/database/typeorm/database.service';
import { ProposalService } from '~/modules/proposal/proposal.service';
import { SharedModule } from '~/shared/shared.module';

describe('ProposalService', () => {
    let databaseService: DatabaseService;
    let service: ProposalService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                DatabaseModule,
                SharedModule,
                RedisModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (configService: ConfigService) => configService.get('redis') || {},
                    inject: [ConfigService],
                }),
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['.env'],
                    load: [token, databaseConfig, redis],
                    cache: true,
                }),
            ],
            providers: [ProposalService],
        }).compile();

        databaseService = module.get<DatabaseService>(DatabaseService);
        service = module.get<ProposalService>(ProposalService);
    });

    afterAll((done) => {
        databaseService.dataSource.destroy();
        done();
    });

    // describe('create', () => {
    //     it('should create a new proposal', async () => {
    //         const createProposalDto: CreateProposalDto = {
    //             typeId: 1,
    //             name: 'Test',
    //             content: 'Test',
    //             details: [
    //                 {
    //                     productId: 1,
    //                     quantity: 1,
    //                     note: 'Test',
    //                 },
    //             ],
    //         };

    //         const result = await service.create(createProposalDto);
    //         expect(result).toBeDefined();
    //         return result;
    //         // Add more assertions to validate the result
    //     });
    // });

    describe('findAll', () => {
        it('should return an array of proposals', async () => {
            const payload = {
                page: 1,
                perPage: 10,
                search: undefined,
                sortBy: undefined,
                type: undefined,
                status: undefined,
            };
            const result = await service.findAll(payload);

            expect(result).toBeDefined();

            // Add more assertions to validate the result
            if (result.data.length > 0) {
                expect(result.data[0].id).toBeDefined();
            } else {
                expect(result.data.length).toBe(0);
            }
        });
    });
});
