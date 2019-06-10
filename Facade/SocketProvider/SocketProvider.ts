import { Injectable } from 'System/Injectable';
import * as SocketIO from 'socket.io';
import { showDebug } from 'App/Helpers/Generator';
import { Mongo } from 'System/Mongo';

export interface IClientConnect {
    socket_id: string;
    private_id: string;
    sockets: Array<SocketIO.Socket>;
}

export enum SocketAction {
    KolUpdatePost = 'kol_update_post'
}

export enum SocketType {
    Error = 'error',
    FlashMessage = 'flash-message'
}

@Injectable
export class SocketProvider {
    private io;
    public clientConnects: Array<IClientConnect> = [];
    constructor(private mongo: Mongo) {}

    pushNotify(receiverId: string, data: any) {
        const client = this.clientConnects.find(client => client.socket_id == receiverId);
        if (client && client.sockets.length > 0) {
            for (const socket of client.sockets) {
                socket.emit('notify', data);
            }
        } else {
            showDebug(`Client is offline: ${receiverId}`);
        }
    }

    pushAdminNotify(message: string, type: string, other?: any) {
        this.clientConnects.filter(client => client.socket_id.match(/^admin-(.*)$/)).forEach(admin => {
            if (admin.sockets.length > 0) {
                for (const socket of admin.sockets) {
                    socket.emit('notify', { message: message, type: type, other: other });
                }
            }
        });
    }

    run(server: any) {
        this.io = SocketIO(server, { origins: '*:*'});

        this.eventNotification();
    }

    private eventNotification() {
        const eventNotification = this.io.of('notification');
        eventNotification.on('connection', s => {
            this.registerSocket(s);
            s.on('disconnect', e => {
                this.unRegisterSocket(s);
            });
        });
    }

    private registerSocket(socket: SocketIO.Socket) {
        if (socket.handshake.query.socket_id) {
            const socketId = socket.handshake.query.socket_id;
            const clientSocket = this.clientConnects.find(client => client.socket_id == socketId);
            if (clientSocket) {
                clientSocket.private_id = socket.id;
                clientSocket.sockets.push(socket);
            } else {
                showDebug(`${socketId} connected!`);
                this.clientConnects.push({
                    socket_id: socketId,
                    private_id: socket.id,
                    sockets: [ socket ]
                });
            }
        }
    }

    private unRegisterSocket(socket: SocketIO.Socket) {
        const socketId = socket.handshake.query.socket_id;
        const clientSocket = this.clientConnects.find(client => client.socket_id == socketId);

        if  (clientSocket) {
            if (clientSocket.sockets.length > 0) {
                clientSocket.sockets = clientSocket.sockets.filter(s => s.id != socket.id);
            }
            if (clientSocket.sockets.length == 0) {
                showDebug(`${clientSocket.socket_id} disconnect!`);
            }
            this.clientConnects = this.clientConnects.filter(s => s.sockets.length > 0);
        }
    }
}
