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
    @InjectBot('management') private readonly bot: Telegraf<any>,
  ) {}

  // async onModuleInit() {
  //   console.log('Attempting to initialize Telegram Bot connection...');

  //   try {
  //     const botInfo = await this.bot.telegram.getMe();
  //     console.log(
  //       `✅ Telegram Bot initialized successfully: @${botInfo.username}`,
  //     );
  //   } catch (error) {
  //     if (error.code === 'ETIMEDOUT' || error.type === 'system') {
  //       console.error(
  //         'CRITICAL ERROR: Failed to connect to Telegram API (ETIMEDOUT).',
  //       );
  //       console.error(
  //         'The Telegram bot feature will be DISABLED but the server will continue to run.',
  //       );
  //     } else {
  //       console.error(
  //         'Telegraf initialization failed for an unknown reason:',
  //         error.message,
  //       );
  //     }
  //   }
  // }

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

  async sendNotificationToWorkTelegramGroup(message: string) {
    await this.bot.telegram.sendMessage(process.env.GROUP_ID, message, {
      message_thread_id: +process.env.WORK_THREAD_ID,
    });
  }

  async sendNotificationToTripsTelegramGroup(message: string) {
    await this.bot.telegram.sendMessage(process.env.GROUP_ID, message, {
      message_thread_id: +process.env.TRIPS_THREAD_ID,
    });
  }

  async sendNotificationToTripsEventsTelegramGroup(message: string) {
    await this.bot.telegram.sendMessage(process.env.GROUP_ID, message, {
      message_thread_id: +process.env.TRIP_EVENTS_THREAD_ID,
    });
  }

  async sendNotificationToDriversTelegramGroup(message: string) {
    await this.bot.telegram.sendMessage(process.env.GROUP_ID, message, {
      message_thread_id: +process.env.DRIVERS_THREAD_ID,
    });
  }
}
