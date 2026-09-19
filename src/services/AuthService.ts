import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export class AuthService {
  static async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) return null;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }
}
