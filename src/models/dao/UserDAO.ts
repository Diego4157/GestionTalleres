import { prisma } from "@/lib/prisma";

export class UserDAO {
  static async getMechanics() {
    return await prisma.user.findMany({
      where: { role: "MECHANIC", isActive: true },
      select: { id: true, name: true },
    });
  }
}
