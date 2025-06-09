import { Ctx, On, Update } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';
import { Context } from 'telegraf';

@Update()
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) {}

  @On('text')
  async onMessage(@Ctx() ctx: Context) {
    this.telegramService.saveMessage(ctx);
  }
}
