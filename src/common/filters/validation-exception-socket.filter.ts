import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  WsExceptionFilter,
} from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch(BadRequestException)
export class ValidationSocketExceptionFilter implements WsExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient<Socket>();

    const response=exception.getResponse()

      const message=(response as {message:string[]}).message.join(' ,')

    client.emit('exception', { status: false, message });
  }
}
