import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountRole } from 'src/account/enums/account-role.enum';

@Injectable()
export class WsAuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  driverAuth() {
    return (client, next) => {
      try {
        const token = client.handshake.headers?.authorization;

        if (!token) throw new Error('Invalid token');

        const payload = this.jwtService.verify(token as string);

        if (payload.role !== AccountRole.DRIVER)
          throw new Error('Invalid token');
        client.data = {
          id: payload.id,
          name: payload.name,
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  adminAuth() {
    return (client, next) => {
      try {
        const token = client.handshake.headers?.authorization;

        if (!token) throw new Error('Invalid token');

        const payload = this.jwtService.verify(token as string);

        if (payload.role == AccountRole.DRIVER)
          throw new Error('Invalid token');

        client.data = {
          id: payload.id,
          name: payload.name,
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  notificationAuth() {
    return (client, next) => {
      try {
        const token = client.handshake.headers?.authorization;

        if (!token) throw new Error('Invalid token');

        const payload = this.jwtService.verify(token as string);

        if (payload.role != AccountRole.CC) throw new Error('Invalid token');

        client.data = {
          id: payload.id,
          name: payload.name,
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
