import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/account/entities/account.entity';
import { LogService } from 'src/sockets/logs/logs.service';
import { VendorLoginRequestDto } from './dto/vendor-login.dto';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private readonly jwtService: JwtService,
    @Inject() private readonly logService: LogService,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
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

  async vendorLogin(loginDto: VendorLoginRequestDto) {
    const { phoneNumber, password } = loginDto;

    const vendor = await this.vendorRepository.findOne({
      where: { phoneNumber },
    });

    if (!vendor || !vendor.comparePassword(password)||!vendor.partner)
      throw new UnauthorizedException('Wrong credentials');

    const accessToken = this.jwtService.sign({
      id: vendor.vendorID,
      name: vendor.name,
      role:'vendor'
    });
    return { accessToken };
  }

  async logout(name: string) {
    this.logService.logoutLog(name);
    return null;
  }
}
