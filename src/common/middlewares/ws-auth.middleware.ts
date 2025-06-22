import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { AccountRole } from 'src/account/enums/account-role.enum';

@Injectable()
export class WsAuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  driverAuth() {
    return (client, next) => {
      try {
        const token = client.handshake?.auth?.token;

        if (!token) throw new WsException('Invalid token');

        const payload = this.jwtService.verify(token as string);

        if (payload.role !== AccountRole.DRIVER)
          throw new WsException('Invalid token');
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
        const token = client.handshake?.auth?.token;

        if (!token) throw new WsException('Invalid token');

        const payload = this.jwtService.verify(token as string);

        if (payload.role == AccountRole.DRIVER)
          throw new WsException('Invalid token');

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

  logAuth() {
    return (client, next) => {
      try {
        const token = client.handshake?.auth?.token;

        if (!token) throw new WsException('Invalid token');

        const payload = this.jwtService.verify(token as string);

        if (
          payload.role != AccountRole.CC &&
          payload.role != AccountRole.DRIVER
        )
          throw new WsException('Invalid token');
        client.data = {
          id: payload.id,
          role: payload.role,
          name: payload.name,
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  vendorAuth() {
    return (client, next) => {
      try {
        const token = client.handshake?.auth?.token;

        if (!token) throw new WsException('Invalid token');

        const payload = this.jwtService.verify(token as string);

        if (payload.role !== 'vendor')
          throw new WsException('Invalid token');

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
