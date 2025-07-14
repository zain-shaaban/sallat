import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Customer } from 'src/customer/entities/customer.entity';
import { Context, Telegraf } from 'telegraf';
import { ArrayContains, Repository } from 'typeorm';

@Injectable()
export class TelegramUserService {
  constructor(
    @InjectBot('user') private readonly userBot: Telegraf<any>,
    @InjectRepository(Customer)
    private readonly customerRespository: Repository<Customer>,
  ) {}

  async startBot(ctx: Context) {
    await ctx.reply(
      `أهلاً بك في بوت شركة سلات!

يمكنك تتبع حالة طلباتك من سلات عن طريق هذا البوت

للبدء، أرسل رقم الهاتف الذي تطلب عن طريقه من سلات`,
    );
  }

  async verifyPhoneNumber(ctx: any) {
    const phoneNumber = this.formatPhoneNumber(ctx);
    if (!phoneNumber) {
      await ctx.reply('هذا الرقم غير صالح، الرجاء إعادة المحاولة');
      return;
    }

    const telegramID = ctx?.message?.from?.id || undefined;
    if (!telegramID) {
      await ctx.reply('تعذر التفعيل، يرجى المحاولة لاحقاً');
      return;
    }

    const customer = await this.customerRespository.findOne({
      where: {
        phoneNumbers: ArrayContains([phoneNumber]),
      },
    });

    if (!customer) {
      await ctx.reply(
        'لم يتم العثور على حساب بهذا الرقم، ربما ليس الرقم الذي اتصلت منه مع سلات.',
      );
      return;
    }

    customer.telegramID = telegramID.toString();
    await this.customerRespository.save(customer);

    await ctx.reply(`أهلاً بك يا ${customer.name}

تم تفعيل حسابك على الرقم ${phoneNumber}

يمكنك من الآن استقبال تحديثات أي طلب تطلبه من سلات!`);
  }

  formatPhoneNumber(ctx: any): string | undefined {
    const message = ctx?.message?.text;
    if (!message) return;

    const cleanedMessage = message.replace(/[\s\-]/g, '');

    const syrianMobileRegex = /(?:\+?963|0)?9\d{8,}/g;
    const matches = cleanedMessage.match(syrianMobileRegex);

    if (matches) {
      const normalizedNumbers = matches.map((raw) => {
        const digitsOnly = raw.replace(/^(\+?963|0)/, '');
        return `0${digitsOnly}`;
      });

      if (normalizedNumbers.some((n) => n.length !== 10)) {
        return;
      }

      return normalizedNumbers.join(', ');
    }
  }

  async sendMessageToCustomer(customerID: string, message: string) {
    const customer = await this.customerRespository.findOne({
      where: { customerID },
    });

    if (!customer?.telegramID) {
      return;
    }

    await this.userBot.telegram.sendMessage(customer.telegramID, message, { parse_mode: "HTML" });
  }
}
