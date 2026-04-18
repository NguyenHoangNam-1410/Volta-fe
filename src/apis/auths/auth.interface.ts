import type { User } from "../users/user.interface";

export interface RequestLoginDto {
  email: string;
  password: string;
}

export interface RequestRegisterDto {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone: string;
}

export interface AuthUserPayload {
  user: User;
}
