import { SetMetadata } from '@nestjs/common';
import { AccountRole } from 'src/account/enums/account-role.enum';
export const Roles = (...roles: AccountRole[]) => SetMetadata('roles', roles);
