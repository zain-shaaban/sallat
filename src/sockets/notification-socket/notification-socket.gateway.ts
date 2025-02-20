import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
  },
})
export class NotificationSocketGateway {}
