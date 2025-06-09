import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account } from './entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DriverMetadata } from './entities/driverMetadata.entity';
import {
  IAccount,
  IDriverAccount,
  ICreateAccountRequest,
  IUpdateAccountRequest,
} from './interfaces/account.interface';
import { AccountRole } from './enums/account-role.enum';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(DriverMetadata)
    private readonly driverRepository: Repository<DriverMetadata>,
  ) {}

  async create({
    name,
    email,
    password,
    phoneNumber,
    salary,
    role,
    assignedVehicleNumber,
    notificationToken,
  }: ICreateAccountRequest): Promise<{ id: string }> {
    const account = this.accountRepository.create({
      name,
      email,
      password,
      phoneNumber,
      salary,
      role,
    });

    const { id } = await this.accountRepository.save(account);
    if (role === AccountRole.DRIVER) {
      await this.driverRepository.insert({
        id,
        assignedVehicleNumber,
        notificationToken,
      });
    }
    return { id };
  }

  async findAll(): Promise<(IAccount | IDriverAccount)[]> {
    const accounts = await this.accountRepository.find({
      relations: ['driverMetadata'],
    });

    const transformed = accounts.map((account) => {
      if (account.role === AccountRole.DRIVER && account.driverMetadata) {
        return plainToInstance(Account, {
          ...account,
          ...account.driverMetadata,
          driverMetadata: undefined,
        });
      }

      return plainToInstance(Account, {
        ...account,
        driverMetadata: undefined,
      });
    });

    return transformed;
  }

  async findOne(id: string): Promise<IAccount | IDriverAccount> {
    let account = await this.accountRepository.findOne({
      where: { id },
      relations: ['driverMetadata'],
    });

    if (!account)
      throw new NotFoundException(`Account with ID ${id} not found`);

    if (account.role === AccountRole.DRIVER) {
      return plainToInstance(Account, {
        ...account,
        ...account.driverMetadata,
        driverMetadata: undefined,
      });
    }

    return account;
  }

  async findByRole(role: string): Promise<(IAccount | IDriverAccount)[]> {
    if (!Object.values(AccountRole).includes(role as AccountRole)) {
      throw new BadRequestException(`Invalid role : ${role}`);
    }

    let accounts = await this.accountRepository.find({
      where: { role: role as AccountRole },
      relations: ['driverMetadata'],
    });

    const transformed = accounts.map((account) => {
      if (account.role === AccountRole.DRIVER) {
        return plainToInstance(Account, {
          ...account,
          ...account.driverMetadata,
          driverMetadata: undefined,
        });
      }

      return plainToInstance(Account, {
        ...account,
        driverMetadata: undefined,
      });
    });

    return transformed;
  }

  async update(
    id: string,
    {
      notificationToken,
      assignedVehicleNumber,
      ...updateData
    }: IUpdateAccountRequest,
  ): Promise<null> {
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(cleanUpdateData).length > 0)
      var { affected: accountAffected } = await this.accountRepository.update(
        id,
        cleanUpdateData,
      );
    if (notificationToken || assignedVehicleNumber)
      var { affected: driverAffected } = await this.driverRepository.update(
        id,
        {
          notificationToken,
          assignedVehicleNumber,
        },
      );
    if (!accountAffected && !driverAffected)
      throw new NotFoundException(`Account with ID ${id} not found`);
    return null;
  }

  async remove(id: string): Promise<null> {
    const { affected } = await this.accountRepository.delete(id);
    if (affected === 0)
      throw new NotFoundException(`Account with ID ${id} not found`);
    return null;
  }

  async findDrivers(): Promise<(IAccount | IDriverAccount)[]> {
    const drivers = await this.accountRepository.find({
      relations: ['driverMetadata'],
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        driverMetadata: {
          assignedVehicleNumber: true,
        },
      },
      where: { role: AccountRole.DRIVER },
    });

    const driversAfterFormatting = drivers.map((driver) => {
      const assignedVehicleNumber = driver.driverMetadata.assignedVehicleNumber;
      delete driver.driverMetadata;
      return { ...driver, assignedVehicleNumber };
    });
    return driversAfterFormatting;
  }
}
