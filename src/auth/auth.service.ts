import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginRequestDto) {
    const { email, password } = loginDto;

    const account = await this.accountRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'name'],
    });

    if (!account || !account.comparePassword(password))
      throw new UnauthorizedException('Wrong credentials');

    const accessToken = this.jwtService.sign({
      id: account.id,
      role: account.role,
      name: account.name,
    });
    return { accessToken };
  }
}
