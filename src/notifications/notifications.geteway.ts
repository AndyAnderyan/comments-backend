import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { EventType } from './dicts/event-type.enum';
import { EntityName } from './dicts/entity-name.enum';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>();
  
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => NotificationsService)) // <-- Оберніть ін'єкцію
    private readonly notificationsService: NotificationsService, // <-- Це залежність [1] (яку Nest не бачить)
  ) {
  }
  
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        throw new Error('No auth token');
      }
      
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub; // Або payload.id, залежно від вашого токена
      
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
      
      // TODO: Додати метод в NotificationsService
      // Відправляємо поточну кількість непрочитаних сповіщень
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread-count', unreadCount);
    } catch (e) {
      this.logger.error(`Connection failed: ${e.message}`);
      client.disconnect();
    }
  }
  
  handleDisconnect(client: Socket) {
    this.connectedUsers.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
      }
    });
  }
  
  sendNotificationToUser(userId: string, payload: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(`${EntityName.notification}.${EventType.created}`, payload);
      this.logger.log(`Sent notification to user ${userId} (socket ${socketId})`);
    } else {
      this.logger.warn(`User ${userId} is not connected. Notification queued.`);
    }
  }
  
  updateUnreadCount(userId: string, count: number) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(`${EntityName.unreadCount}.${EventType.updated}`, { count });
    }
  }
  
  broadcastEvent(eventName: string, payload: any) {
    this.server.emit(eventName, payload);
    this.logger.log(`Broadcasted event [${eventName}] to all clients.`);
  }
}
