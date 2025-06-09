import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramMessage } from './entities/messages.entity';
import { Repository } from 'typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  constructor(
    @InjectRepository(TelegramMessage)
    private readonly telegramRepository: Repository<TelegramMessage>,
    @InjectBot() private readonly bot: Telegraf<any>,
  ) {}

  saveMessage(ctx: any) {
    if (ctx?.message?.chat?.id == process.env.GROUP_ID) {
      const text = ctx?.message?.text || undefined;
      const from =
        ctx?.message?.from?.first_name + ' ' + ctx?.message?.from?.last_name ||
        undefined;
      const topicID = ctx?.message?.message_thread_id || undefined;
      this.telegramRepository.insert({ from, text, topicID });
    }
  }

  async sendNotificationToTelegramGroup(message: string) {
    await this.bot.telegram.sendMessage(process.env.GROUP_ID, message, {
      message_thread_id: +process.env.THREAD_ID,
    });
  }
}
