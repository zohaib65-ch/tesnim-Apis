export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    plan: string;
    isEmailVerified: boolean;
  };
}
