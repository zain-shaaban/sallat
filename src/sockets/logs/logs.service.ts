import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramService } from 'src/telegram-bot/telegram.service';
import { Log } from './entites/logs.entity';
import { In, Not, Repository } from 'typeorm';
import { Namespace, Socket } from 'socket.io';
import { AccountRole } from 'src/account/enums/account-role.enum';
import { logger } from 'src/common/error_logger/logger.util';

@Injectable()
export class LogService {
  private io: Namespace;

  constructor(
    @Inject() private readonly telegramService: TelegramService,
    @InjectRepository(Log) private readonly logRepository: Repository<Log>,
  ) {}

  async handleOnConnection(client: Socket) {
    if (client.data.role == AccountRole.DRIVER) {
      const logs = await this.logRepository.find({
        where: { driverID: client.data.id },
        select: ['message', 'createdAt'],
        take: 100,
        order: { createdAt: 'desc' },
      });

      client.emit('onConnection', logs);
    } else {
      client.join('cc');
      const logs = await this.logRepository.find({
        where: { type: Not(In(['login', 'logout'])) },
        select: ['message', 'createdAt'],
        take: 500,
        order: { createdAt: 'desc' },
      });

      client.emit('onConnection', logs);
    }
  }

  loginLog(username: string) {
    const message = `يرجى العلم أن الموظف ${username} قام بتسجيل الدخول.`;
    this.telegramService.sendNotificationToWorkTelegramGroup(message);
    this.logRepository.save({ message, type: 'login' });
  }

  logoutLog(username: string) {
    const message = `يرجى العلم أن الموظف ${username} قام بتسجيل الخروج.`;
    this.telegramService.sendNotificationToWorkTelegramGroup(message);
    this.logRepository.save({ message, type: 'logout' });
  }

  async createPartnerTripLog(
    partnerName: string,
    customerName: string,
    customerPhoneNumber: string,
  ) {
    const message = `قام المتجر ${partnerName} بطلب رحلة للعميل ${customerName} رقمه ${customerPhoneNumber}.`;

    this.sendMessageToAdmins(message, 'newPartnerTrip');
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async cancelPartnerTripLog(partnerName: string, customerName: string) {
    const message = `قام المتجر ${partnerName} بالغاء الطلب للعميل ${customerName}.`;

    this.sendMessageToAdmins(message, 'cancelPartnerTrip');
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async partnerTripAcceptedLog(ccName: string, partnerName: string) {
    const message = `قام الموظف ${ccName} بقبول الرحلة من المتجر ${partnerName}.`;

    this.sendMessageToAdmins(message, 'acceptPartnerTrip');

    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async partnerTripRejectedLog(ccName: string, partnerName: string) {
    const message = `قام الموظف ${ccName} برفض الرحلة من المتجر ${partnerName}.`;

    this.sendMessageToAdmins(message, 'rejectPartnerTrip');

    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async changePartnerAvailabilityLog(ccName: string, availability: boolean) {
    if (!availability)
      var message = `قام الموظف ${ccName} بحجب الرحلات من المتاجر.`;
    else var message = `قام الموظف ${ccName} بفك الحجب عن الرحلات من المتاجر.`;
    this.sendMessageToAdmins(message, 'partnerAvailabilityChanged');
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async createNewNormalTripWithDriverLog(
    ccName: string,
    customerName: string,
    tripNumber: number,
    vendorName: string,
    driverID: string,
    driverName: string,
  ) {
    const message = `قام الموظف ${ccName} بتسجيل رحلة جديدة للعميل ${customerName} من المتجر ${vendorName} برقم ${tripNumber} و وتم اسنادها الى السائق ${driverName}.`;

    this.sendMessageToAdmins(
      message,
      'createNewNormalTripWithDriver',
      driverID,
    );

    this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async createNewAlternativeTripWithDriverLog(
    ccName: string,
    customerName: string,
    tripNumber: number,
    driverID: string,
    driverName: string,
  ) {
    const message = `قام الموظف ${ccName} بتسجيل رحلة جديدة من النمط البديل للعميل ${customerName} برقم ${tripNumber} و وتم اسنادها الى السائق ${driverName}.`;

    this.sendMessageToAdmins(
      message,
      'createNewAlternativeTripWithDriver',
      driverID,
    );

    this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  createNewNormalTripWithoutDriverLog(
    ccName: string,
    customerName: string,
    tripNumber: number,
    vendorName: string,
  ) {
    const message = `قام الموظف ${ccName} بتسجيل رحلة جديدة للعميل ${customerName} من المتجر ${vendorName} برقم ${tripNumber} ولم يتم اسنادها إلى سائق بعد.`;

    this.sendMessageToAdmins(message, 'createNewNormalTripWithoutDriver');
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async createNewAlternativeTripWithoutDriverLog(
    ccName: string,
    customerName: string,
    tripNumber: number,
  ) {
    const message = `قام الموظف ${ccName} بتسجيل رحلة جديدة من النمط البديل للعميل ${customerName} برقم ${tripNumber} ولم يتم اسنادها إلى سائق بعد.`;

    this.sendMessageToAdmins(message, 'createNewAlternativeTripWithoutDriver');
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async acceptTripLog(
    driverID: string,
    driverName: string,
    tripNumber: number,
  ) {
    const message = `قام السائق ${driverName} بقبول الرحلة رقم  ${tripNumber}.`;

    this.sendMessageToAdmins(message, 'acceptTrip', driverID);

    this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsEventsTelegramGroup(message);
  }

  async rejectTripLog(
    driverID: string,
    driverName: string,
    tripNumber: number,
  ) {
    const message = `قام السائق ${driverName} برفض الرحلة رقم ${tripNumber}.`;

    this.sendMessageToAdmins(message, 'rejectTrip', driverID);

    this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsEventsTelegramGroup(message);
  }

  async onVendorLog(
    driverID: string,
    driverName: string,
    vendorName: string,
    tripNumber: number,
  ) {
    const message = `وصل السائق ${driverName} إلى المتجر ${vendorName} بنجاح للرحلة رقم ${tripNumber}.`;

    this.sendMessageToAdmins(message, 'onVendor', driverID);

    this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsEventsTelegramGroup(message);
  }

  async leftVendorLog(
    driverID: string,
    driverName: string,
    vendorName: string,
    tripNumber: number,
  ) {
    const message = `غادر السائق ${driverName} المتجر ${vendorName} بعد استلام الطلب للرحلة رقم ${tripNumber}.`;

    this.sendMessageToAdmins(message, 'leftVendor', driverID);

    this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsEventsTelegramGroup(message);
  }

  async endTripLog(
    driverID: string,
    driverName: string,
    customerName: string,
    tripNumber: number,
  ) {
    const message = `وصل السائق ${driverName} إلى موقع العميل ${customerName} وتم تسليم الطلب للرحلة رقم ${tripNumber} بنجاح.`;

    this.sendMessageToAdmins(message, 'endTrip', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async changeToAlternativeLog(
    driverID: string,
    driverName: string,
    tripNumber: number,
  ) {
    const message = `قام السائق ${driverName} بتغيير الرحلة رقم${tripNumber} الى النمط البديل.`;

    this.sendMessageToAdmins(message, 'changeToAlternative', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async addWayPointLog(
    driverID: string,
    driverName: string,
    tripNumber: number,
  ) {
    const message = `قام السائق ${driverName} بإضافة نقطة توقف جديدة أثناء الرحلة رقم ${tripNumber}.`;

    this.sendMessageToAdmins(message, 'wayPoint', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsEventsTelegramGroup(message);
  }

  async pullTripLog(
    driverID: string,
    driverName: string,
    ccName: string,
    tripNumber: number,
  ) {
    const message = `تم سحب الرحلة رقم ${tripNumber} من السائق ${driverName} بواسطة الموظف ${ccName}.`;

    this.sendMessageToAdmins(message, 'pullTrip', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async assignNewDriverLog(
    driverID: string,
    driverName: string,
    ccName: string,
    tripNumber: number,
  ) {
    const message = `قام الموظف ${ccName} بإسناد الرحلة رقم ${tripNumber} للسائق ${driverName} .`;

    this.sendMessageToAdmins(message, 'assignNewDriver', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async cancelledTripLog(ccName: string, tripNumber: number, driverID: string) {
    const message = `تم إلغاء الرحلة رقم ${tripNumber} بواسطة الموظف ${ccName}.`;

    this.sendMessageToAdmins(message, 'cancelledTrip', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async failedTripLog(
    driverID: string,
    driverName: string,
    tripNumber: number,
    reason: string,
  ) {
    const message = `قام السائق ${driverName} بإلغاء الرحلة رقم ${tripNumber}، :بسبب ${reason}.`;

    this.sendMessageToAdmins(message, 'failedTrip', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToTripsTelegramGroup(message);
  }

  async changeDriverToUnAvailableByDriverLog(
    driverID: string,
    driverName: string,
  ) {
    const message = `السائق ${driverName} غير متاح الآن.`;

    this.sendMessageToAdmins(message, 'driverUnAvailableByDriver', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToDriversTelegramGroup(message);
  }

  async changeDriverToAvailableByDriverLog(
    driverID: string,
    driverName: string,
  ) {
    const message = `السائق ${driverName} متاح الآن.`;

    this.sendMessageToAdmins(message, 'driverAvailableByDriver', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToDriversTelegramGroup(message);
  }

  async changeDriverToUnAvailableByCcLog(
    driverID: string,
    driverName: string,
    ccName: string,
  ) {
    const message = `قام الموظف ${ccName} بحجب السائق ${driverName}.`;

    this.sendMessageToAdmins(message, 'driverUnAvailableByCc', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToDriversTelegramGroup(message);
  }

  async changeDriverToAvailableByCcLog(
    driverID: string,
    driverName: string,
    ccName: string,
  ) {
    const message = `قام الموظف ${ccName} بفك الحجب عن السائق ${driverName}.`;

    this.sendMessageToAdmins(message, 'driverAvailableByCc', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToDriversTelegramGroup(message);
  }

  async emergencyStateLog(driverID: string, driverName: string) {
    const message = `الموظف ${driverName} في حالة خطر.`;

    this.sendMessageToAdmins(message, 'emergencyState', driverID);

    await this.sendMessageToDriver(driverID, message);
    this.telegramService.sendNotificationToDriversTelegramGroup(message);
  }

  private sendMessageToAdmins(
    message: string,
    type: string,
    driverID: string = undefined,
  ) {
    try {
      this.logRepository.save({ driverID, message, type });

      this.io.to('cc').emit('newLog', { message, type });
    } catch (error) {
      logger.error(error.message, error.stack);
    }
  }

  private async sendMessageToDriver(driverID: string, message: string) {
    try {
      const targetSocket = (await this.io.fetchSockets()).find(
        (socket) => socket?.data?.id === driverID,
      );

      targetSocket?.emit('newLog', { message });
    } catch (error) {
      logger.error(error.message, error.stck);
    }
  }

  public initIO(server: Namespace) {
    this.io = server;
  }
}
