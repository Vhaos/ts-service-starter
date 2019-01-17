import { Model } from '.';

export interface User extends Model {
  email: string;
  is_verified: boolean;
  password: string;
  phone_number: string;
  isValidPassword: (plainText: string) => Promise<Boolean>;
}

/**
 * Data Transfer Object describing User login payload
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Describes the Data transfer object required for
 * instantiating a password reset.
 */
export interface ResetPasswordDTO {
  email: string;
}

/**
 * Describes the Data transfer object required for
 * changing a password.
 */
export interface ChangePasswordDTO {
  email: string;
  password: string;
  token: string;
}
