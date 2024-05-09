import { Module } from '@nestjs/common';
import { SocketAdapter } from './socket.adapter';
import { SocketGateway } from './socket.gateway';

@Module({
    providers: [SocketAdapter, SocketGateway],
    exports: [SocketAdapter],
})
export class SocketModule {}
