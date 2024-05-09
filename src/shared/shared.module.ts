import { Global, Module } from '@nestjs/common';
import { ServicesModule } from './services/services.module';

@Global()
@Module({
    providers: [],
    imports: [ServicesModule],
    exports: [ServicesModule],
})
export class SharedModule {}
