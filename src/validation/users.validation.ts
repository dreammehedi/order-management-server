import z from "zod";

export const usersSchema = z.object({
  username: z.string(),
  email: z.string(),
  is_active: z.boolean().default(true),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(8, "Old password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirm_password: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New password and confirm password do not match",
    path: ["confirm_password"],
  });

export const userAccountStatusSchema = z.object({
  is_active: z.boolean(),
  user_id: z.string().min(1, "User ID is required"),
});

export const userAccountPasswordSchema = z.object({
  password: z.string().min(8, "New password must be at least 8 characters"),
  user_id: z.string().min(1, "User ID is required"),
});
