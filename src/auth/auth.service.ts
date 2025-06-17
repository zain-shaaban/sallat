import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/account/entities/account.entity';
import { LogService } from 'src/sockets/logs/logs.service';
import { AccountRole } from 'src/account/enums/account-role.enum';
import { OnlineDrivers } from 'src/sockets/driver/online-drivers';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private readonly jwtService: JwtService,
    @Inject() private readonly logService: LogService,
    @Inject() private readonly onlineDrivers: OnlineDrivers,
  ) {}

  async login(loginDto: LoginRequestDto) {
    const { email, password } = loginDto;

    const account = await this.accountRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'name'],
    });

    if (!account || !account.comparePassword(password))
      throw new UnauthorizedException('Wrong credentials');

    this.logService.loginLog(account.name);

    const accessToken = this.jwtService.sign({
      id: account.id,
      role: account.role,
      name: account.name,
    });
    return { accessToken };
  }

  async logout(id: string, name: string, role: string) {
    this.logService.logOut(name);
    if (role == AccountRole.DRIVER)
      this.onlineDrivers.drivers = this.onlineDrivers.drivers.filter(
        (d) => d.driverID !== id,
      );
    return null
  }
}
