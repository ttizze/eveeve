import { prisma } from "~/utils/prisma";

export async function isUserNameTaken(userName: string): Promise<boolean> {
  const existingUser = await prisma.user.findUnique({
    where: { userName },
  });
  return !!existingUser;
}

export async function updateUserName(userId: number, userName: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { userName },
  });
}