import jwt from "jsonwebtoken";
import config from "../config";
import { IUser } from "../models/user.model";

// Generate JWT access token
export const generateToken = (user: IUser): string => {
  return jwt.sign({ id: user._id?.toString() }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Generate JWT refresh token
export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign({ id: user._id?.toString() }, config.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.JWT_SECRET);
};

// Verify refresh token
export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
