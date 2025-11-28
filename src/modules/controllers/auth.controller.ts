import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import {
  changePasswordSchema,
  loginSchema,
  usersSchema,
} from "../validation/auth.validation";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validated = usersSchema.parse(req.body);
    const result = await AuthService.registerUserService(validated);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await AuthService.loginUserService(validated);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    console.log(req.user_id, req.token);
    await AuthService.logoutUserService(req.user_id!, req.token!);

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const validated = changePasswordSchema.parse(req.body);

    await AuthService.changePasswordService(req.user_id!, validated);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const userProfileData = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.getUserProfile(req.user_id!);

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const updated = await AuthService.updateUserProfileService(
      req.user_id!,
      req.body
    );

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      data: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
