"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export type LoginState = { error?: string };

export async function authenticate(_: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau kata sandi salah." };
    }
    throw error;
  }

  redirect("/dashboard");
}
