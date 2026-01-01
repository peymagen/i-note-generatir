import { type BaseSchema } from "../../common/dto/base.dto";

export interface IUser extends BaseSchema {
  name: string;
  email: string;
  password?: string;
  isActive?: boolean;
}


export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

