import { AccountRole } from '../enums/account-role.enum';



export interface IAccount {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: AccountRole;
  salary?: number;
  createdAt: Date;
}

export interface IDriverAccount extends IAccount {
  assignedVehicleNumber?: string;
  notificationToken?: string;
}

export interface ICreateAccountRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: AccountRole;
  salary?: number;
  assignedVehicleNumber?: string;
  notificationToken?: string;
}

export interface IUpdateAccountRequest {
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  role?: AccountRole;
  salary?: number;
  assignedVehicleNumber?: string;
  notificationToken?: string;
}

export interface IAccountResponse {
  status: boolean;
  data: {
    id: string;
  } | null;
}

export interface IAccountListResponse {
  status: boolean;
  data: IAccount[] | IDriverAccount[];
} 