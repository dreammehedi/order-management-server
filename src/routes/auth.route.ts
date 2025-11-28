import express from "express";

import {
  changePassword,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
  userProfileData,
} from "../modules/controllers/auth.controller";

import { verifyToken } from "../middlewares/verifyToken.middleware";
import { zodValidate } from "../middlewares/zodValidate.middleware";
import {
  changePasswordSchema,
  loginSchema,
  usersSchema,
} from "../validation/users.validation";

const AuthenticationRouter = express.Router();

AuthenticationRouter.post(
  "/auth/register",
  zodValidate(usersSchema),
  registerUser
);
AuthenticationRouter.post("/auth/login", zodValidate(loginSchema), loginUser);
AuthenticationRouter.post("/auth/logout", verifyToken, logoutUser);
AuthenticationRouter.get("/auth/user/profile", verifyToken, userProfileData);
AuthenticationRouter.patch(
  "/auth/user/profile-update",
  verifyToken,
  updateUserProfile
);
AuthenticationRouter.post(
  "/auth/change-password",
  verifyToken,
  zodValidate(changePasswordSchema),
  changePassword
);

export { AuthenticationRouter };
