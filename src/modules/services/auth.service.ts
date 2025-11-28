import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { JWT_SECRET } from "../../secrets";

export class AuthService {
  // register user
  static async registerUserService(data: any) {
    const { username, email, password } = data;

    const existing = await prisma.users.findFirst({
      where: { email },
    });
    if (existing) throw new Error("User already exists with this email!");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "USER",
        is_active: true,
        token: "",
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET!,
      { expiresIn: "7d" }
    );

    await prisma.users.update({
      where: { id: user.id },
      data: { token },
    });

    return { user, token };
  }

  // login user
  static async loginUserService(data: any) {
    const { email, password } = data;

    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) throw new Error("User not found!");

    if (!user.is_active) throw new Error("User inactive. Contact admin!");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials!");

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET!,
      { expiresIn: "7d" }
    );

    await prisma.users.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { user, token };
  }

  // logout user
  static async logoutUserService(userId: string) {
    await prisma.users.update({
      where: { id: userId },
      data: { token: null },
    });
    return true;
  }

  // change password
  static async changePasswordService(userId: string, data: any) {
    const { old_password, new_password } = data;

    const user = await prisma.users.findFirst({ where: { id: userId } });
    if (!user) throw new Error("User not found!");

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) throw new Error("Old password incorrect!");

    const isSame = await bcrypt.compare(new_password, user.password);
    if (isSame) throw new Error("New password cannot be old password!");

    const hashed = await bcrypt.hash(new_password, 10);

    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return true;
  }

  // get user profile
  static async getUserProfile(userId: string) {
    const user = await prisma.users.findFirst({ where: { id: userId } });
    if (!user) throw new Error("Profile not found!");
    return user;
  }

  // update user profile
  static async updateUserProfileService(userId: string, body: any) {
    const updateData: any = {};

    for (const key in body) {
      if (body[key] !== undefined && body[key] !== null && body[key] !== "") {
        updateData[key] = body[key];
      }
    }

    const updated = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    return updated;
  }
}
