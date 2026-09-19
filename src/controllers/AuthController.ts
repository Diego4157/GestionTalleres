"use server";

import { signIn, signOut } from "@/auth";

export class AuthController {
  static async login(formData: FormData) {
    try {
      await signIn("credentials", formData);
    } catch (error) {
      if ((error as any).type === 'CredentialsSignin') {
        return { error: 'Credenciales inválidas.' };
      }
      throw error;
    }
  }

  static async logout() {
    await signOut();
  }
}
