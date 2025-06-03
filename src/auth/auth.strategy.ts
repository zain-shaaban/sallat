import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Account } from 'src/account/entities/account.entity';
import { AccountRole } from 'src/account/enums/account-role.enum';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject() configService: ConfigService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { id: string; role: AccountRole }) {
    const account = await this.accountRepository.findOneBy({
      id: payload.id,
      role: payload.role,
    });
    if (!account) throw new UnauthorizedException();
    return { id: payload.id, role: payload.role };
  }
}
