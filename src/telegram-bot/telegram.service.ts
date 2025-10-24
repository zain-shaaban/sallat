import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramMessage } from './entities/messages.entity';
import { Repository } from 'typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { permittedCrossDomainPolicies } from 'helmet';

@Injectable()
export class TelegramService {
  constructor(
    @InjectRepository(TelegramMessage)
    private readonly telegramRepository: Repository<TelegramMessage>,
    @InjectBot('management') private readonly bot: Telegraf<any>,
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

  async sendNotificationToUpdatesTelegramGroup(message: string) {
    await this.bot.telegram.sendMessage(process.env.GROUP_ID, message, {
      message_thread_id: +process.env.UPDATES_THREAD_ID,
    });
  }
}
