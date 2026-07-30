"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const authSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
  name: z.string().min(1).max(40).optional(),
});

export async function signInAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect("/login?error=" + encodeURIComponent(parsed.error.issues[0]?.message ?? "表单无效"));
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/me",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=" + encodeURIComponent("邮箱或密码不正确"));
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || "新同学",
  });
  if (!parsed.success) {
    redirect("/register?error=" + encodeURIComponent(parsed.error.issues[0]?.message ?? "表单无效"));
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    redirect("/register?error=" + encodeURIComponent("该邮箱已注册"));
  }

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name ?? "新同学",
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "student",
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/me",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
