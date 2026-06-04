import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })
export class OrdersGateway {
  @WebSocketServer() server: Server;

  // El cliente o admin se une a su sala
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room); // user:<id> o "admin"
  }

  // Emite a la sala admin -> dispara sonido + refresco de dashboard
  notifyNewOrder(order: any) {
    this.server.to('admin').emit('order:new', order);
  }

  // Emite al cliente dueno del pedido y a admin
  notifyStatusChange(order: any) {
    this.server.to(`user:${order.userId}`).emit('order:status', order);
    this.server.to('admin').emit('order:update', order);
  }
}
