"use server"

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "../db";

// Get user

export async function createOrGetUser() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Not authenticated");

  let dbUser = await prisma.user.findUnique({ where: { clerkUserId: userId } });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email: user.emailAddresses[0].emailAddress,
        username: user.username,
        firstName: `${user.firstName}`,
        lastName: `${user.lastName}`,
      },
    });
  }

  return dbUser;
}

export async function getAllUsers() {
  const user = await createOrGetUser();
  if (!user) throw new Error("Not authenticated");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: user.clerkUserId },
    select: {
      id: true,
      stripeConnectedLinked: true,
      isAdmin: false
    },
  });
  if (!currentUser) throw new Error("User not found");

  const allUsers = await prisma.user.findMany({
    where: currentUser.stripeConnectedLinked
      ? { id: { not: currentUser.id } }
      : { stripeConnectedLinked: true, isAdmin: false, id: { not: currentUser.id } },
    select: {
      id: true,
      customId: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      profileImage: true,
    },
  });

  return allUsers;
}

export async function getStripeConnnectUser(userId: string) {
  const data = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    select: {
      stripeConnectedLinked: true,
    },
  });

  return data;
}

export async function getConnections() {
  const user = await createOrGetUser();
  if (!user) throw new Error("Not authenticated");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: user.clerkUserId },
    include: {
      connections: {
        include: {
          connectedUser: {
            select: {
              id: true,
              customId: true,
              email: true,
              firstName: true,
              lastName: true,
              username: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  if (!currentUser) throw new Error("User not found");

  const connections = currentUser.connections.map((connection) => ({
    id: connection.id,
    userId: connection.connectedUserId,
    customId: connection.connectedUser.customId,
    email: connection.connectedUser.email,
    firstName: connection.connectedUser.firstName,
    lastName: connection.connectedUser.lastName,
    username: connection.connectedUser.username,
    profileImage: connection.connectedUser.profileImage,
  }));

  return connections;
}

export async function hasConnectionWithUser({ userId }: { userId: string }) {
  const user = await createOrGetUser();
  if (!user) throw new Error("Not authenticated");

  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { userId: user.id, connectedUserId: userId },
        { userId: userId, connectedUserId: user.id },
      ],
    },
  });

  return !!connection;
}

export async function deleteConnection({ connectionId }: { connectionId: string }) {
  const user = await createOrGetUser();
  if (!user) throw new Error("Not authenticated");

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) throw new Error("Connection not found");

  if (connection.userId !== user.id && connection.connectedUserId !== user.id) {
    throw new Error("Not authorized to delete this connection");
  }

  await prisma.connection.delete({
    where: { id: connectionId },
  });

  return { message: "Connection deleted successfully" };
}

export async function getUserById({ receiverId }: { receiverId: string }) {

  const userToConnect = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!userToConnect) throw new Error("User to connect not found");

  return userToConnect;
}

export async function getAdminUser() {
  const userAdminId = process.env.ADMIN_ACCOUNT_ID!;
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const adminUser = await prisma.user.findUnique({
    where: { clerkUserId: userAdminId },
  });

  return adminUser;
}