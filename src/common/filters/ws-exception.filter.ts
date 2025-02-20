import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    console.log("hello my name is zein")
    const client = host.switchToWs().getClient<Socket>();
    client.emit('error', {
      status: false,
      message: exception.message,
    });
  }
}
