import { INestApplication } from '@nestjs/common';
import { SocketAdapter } from '~/modules/socket/socket.adapter';

export function bootstrapSocket(app: INestApplication): void {
    app.useWebSocketAdapter(new SocketAdapter(app));
}
