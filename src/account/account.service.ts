import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account } from './entities/account.entity';
import * as bcrypt from 'bcryptjs';
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
import { AccountController } from './account.controller';

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
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { id } = await this.accountRepository.save({
      name,
      email,
      password,
      phoneNumber,
      salary,
      role,
    });
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
      throw new BadRequestException(`Invalid role: ${role}`);
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
      name,
      email,
      password,
      phoneNumber,
      salary,
      role,
      assignedVehicleNumber,
      notificationToken,
    }: IUpdateAccountRequest,
  ): Promise<null> {
    const { affected: accountAffected } = await this.accountRepository.update(
      id,
      {
        name,
        email,
        password: password
          ? bcrypt.hashSync(password, bcrypt.genSaltSync())
          : undefined,
        phoneNumber,
        salary,
        role,
      },
    );
    const { affected: driverAffected } = await this.driverRepository.update(
      id,
      {
        notificationToken,
        assignedVehicleNumber,
      },
    );
    if (accountAffected === 0 && driverAffected === 0)
      throw new NotFoundException(`Account with ID ${id} not found`);
    return null;
  }

  async remove(id: string): Promise<null> {
    const { affected } = await this.accountRepository.delete(id);
    if (affected === 0)
      throw new NotFoundException(`Account with ID ${id} not found`);
    return null;
  }
}
