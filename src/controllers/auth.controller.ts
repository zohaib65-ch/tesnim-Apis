import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

// --- Auth Handlers ---

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.refreshToken(req.body);
    res.status(200).json(result);
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.logout(req.user.id);
  res.status(200).json(result);
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body);
    res.status(200).json(result);
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body);
    res.status(200).json(result);
  }
);

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyEmail(req.body);
  res.status(200).json(result);
});

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.changePassword(req.user.id, req.body);
    res.status(200).json(result);
  }
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json(result);
  }
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getProfile(req.user.id);
  res.status(200).json({ success: true, user: result });
});
