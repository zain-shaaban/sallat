import { Command, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramUserService } from './telegram-user.service';

@Update()
export class TelegramUserUpdate {
  constructor(
    private readonly telegramUserService: TelegramUserService
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.telegramUserService.startBot(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    await this.telegramUserService.verifyPhoneNumber(ctx);
  }
}
