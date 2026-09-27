export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
  phone?: string | null;
  company: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgetPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

export interface ChangePasswordInput {
  old_password: string;
  new_password: string;
  new_password_confirmation?: string;
}
