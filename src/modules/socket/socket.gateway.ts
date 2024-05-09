import { WebSocketGateway } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TokenService } from '~/shared/services';

@WebSocketGateway()
export class SocketGateway {
    _server: Server;

    constructor(private authService: TokenService) {
        //
    }

    private afterInit(server) {
        this._server = server;

        console.log('Socket is listening.');
    }

    // connection requires the client to pass their auth token
    // as part of the query, if valid token, they can connect
    // https://stackoverflow.com/questions/58670553/nestjs-gateway-websocket-how-to-send-jwt-access-token-through-socket-emit
    private async handleConnection(socket: Socket) {
        try {
            // get socket headers
            const header = socket.handshake.headers['authorization'];
            if (!header) {
                socket.disconnect(true);
                return;
            }

            // get user id from token
            const id = (await this.authService.verifyAuthToken({ authToken: header })).id;
            console.log(header, id);

            // connected to room based on their user _id
            if (id) {
                socket.join(id);
                this._server.to(id).emit('events', 'Welcome aboard');
            } else {
                socket.disconnect(true);
            }
        } catch (err) {
            console.log('handleConnection error', err);
            socket.disconnect(true);
        }
    }

    private handleDisconnect(socket: Socket) {
        console.log('Client disconnecting');
    }
}
