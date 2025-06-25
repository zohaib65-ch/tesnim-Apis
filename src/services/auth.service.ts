import crypto from "crypto";
import { User, IUser } from "../models/user.model";
import { AppError } from "../utils/appError";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { emailService } from "./email.service";
import {
  RegisterUserInput,
  LoginUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  RefreshTokenInput,
  ChangePasswordInput,
  UpdateProfileInput,
  AuthResponse,
} from "../types/auth.types";
import { logger } from "../utils/logger";

class AuthService {
  // Register a new user
  async register(userData: RegisterUserInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      verificationToken,
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        plan: user.plan,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  // Login user
  async login(loginData: LoginUserInput): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        plan: user.plan,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  // Refresh token
  async refreshToken(
    refreshData: RefreshTokenInput
  ): Promise<{ token: string }> {
    const { refreshToken } = refreshData;

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user by ID and check if refresh token matches
      const user = await User.findById(decoded.id).select("+refreshToken");
      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError("Invalid refresh token", 401);
      }

      // Generate new access token
      const newToken = generateToken(user);

      return { token: newToken };
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  // Logout user
  async logout(userId: string): Promise<{ success: boolean }> {
    // Find user and clear refresh token
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.refreshToken = undefined;
    await user.save();

    return { success: true };
  }

  // Forgot password
  async forgotPassword(
    forgotData: ForgotPasswordInput
  ): Promise<{ success: boolean }> {
    const { email } = forgotData;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User with this email does not exist", 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expiry (30 minutes)
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);

    await user.save();

    // Send email with reset token
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
      return { success: true };
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      logger.error(`Failed to send password reset email: ${error}`);
      throw new AppError("Failed to send password reset email", 500);
    }
  }

  // Reset password
  async resetPassword(
    resetData: ResetPasswordInput
  ): Promise<{ success: boolean }> {
    const { token, password } = resetData;

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired token", 400);
    }

    // Update password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      await emailService.sendPasswordChangeConfirmation(user.email);
    } catch (error) {
      logger.error(`Failed to send password change confirmation: ${error}`);
      // We don't throw here, as the password has already been reset
    }

    return { success: true };
  }

  // Verify email
  async verifyEmail(
    verifyData: VerifyEmailInput
  ): Promise<{ success: boolean }> {
    const { token } = verifyData;

    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new AppError("Invalid verification token", 400);
    }

    // Update user to mark as verified
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return { success: true };
  }

  // Change password (when user is logged in)
  async changePassword(
    userId: string,
    changeData: ChangePasswordInput
  ): Promise<{ success: boolean }> {
    const { currentPassword, newPassword } = changeData;

    // Find user by ID
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    try {
      await emailService.sendPasswordChangeConfirmation(user.email);
    } catch (error) {
      logger.error(`Failed to send password change confirmation: ${error}`);
      // We don't throw here as the password has already been changed
    }

    return { success: true };
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updateData: UpdateProfileInput
  ): Promise<{ success: boolean; user: Partial<IUser> }> {
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if email is being updated and not already in use
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        throw new AppError("Email is already in use", 400);
      }
    }

    // Update user fields
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.email) user.email = updateData.email;

    await user.save();

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        plan: user.plan,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  // Get user profile
  async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      plan: user.plan,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
