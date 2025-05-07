import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDtoRequest } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DriverMetadata } from './entities/driverMetadata.entity';

export enum AccountRole {
  DRIVER = 'driver',
  CC = 'cc',
  MANAGER = 'manager',
  SUPERADMIN = 'superadmin',
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(DriverMetadata)
    private driverRepository: Repository<DriverMetadata>,
  ) {}

  async create(createAccountDto: CreateAccountDtoRequest) {
    let {
      name,
      email,
      password,
      phoneNumber,
      salary,
      role,
      assignedVehicleNumber,
      notificationToken,
    } = createAccountDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { id } = await this.accountRepository.save({
      name,
      email,
      password,
      phoneNumber,
      salary,
      role,
    });
    if (role == 'driver') {
      this.driverRepository.insert({
        id,
        assignedVehicleNumber,
        notificationToken,
      });
    }
    return { id };
  }

  async findAll() {
    let allAccounts = await this.accountRepository.find({
      relations: ['driverMetadata'],
    });
    allAccounts = allAccounts.map((account) => {
      if (account.role == 'driver') {
        account = { ...account, ...account.driverMetadata };
      }
      delete account.driverMetadata;
      return account;
    });
    return plainToInstance(Account, allAccounts);
  }

  async findOne(id: string) {
    let account = await this.accountRepository.findOne({
      where: { id },
      relations: ['driverMetadata'],
    });
    if (!account) throw new NotFoundException();
    if (account.role == 'driver') {
      account = { ...account, ...account.driverMetadata };
    }
    delete account.driverMetadata;
    return plainToInstance(Account, account);
  }

  async findByRole(role: string) {
    if (!Object.values(AccountRole).includes(role as AccountRole))
      throw new NotFoundException('role not exist');
    let allAccounts = await this.accountRepository.find({
      where: { role },
      relations: ['driverMetadata'],
    });
    allAccounts = allAccounts.map((account) => {
      if (account.role == 'driver') {
        account = { ...account, ...account.driverMetadata };
      }
      delete account.driverMetadata;
      return account;
    });
    return plainToInstance(Account, allAccounts);
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    let {
      name,
      email,
      password,
      phoneNumber,
      salary,
      role,
      assignedVehicleNumber,
      notificationToken,
    } = updateAccountDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { affected: accountAffected } = await this.accountRepository.update(
      id,
      {
        name,
        email,
        password,
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
    if (accountAffected == 0 && driverAffected == 0)
      throw new NotFoundException();
    return null;
  }

  async remove(id: string) {
    const { affected } = await this.accountRepository.delete(id);
    if (affected == 0) throw new NotFoundException();
    return null;
  }
}
