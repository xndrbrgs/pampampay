"use server"

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "../db";
import { custom } from "zod";

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
  });
  if (!currentUser) throw new Error("User not found");

  const allUsers = await prisma.user.findMany({
    where: {
      id: { not: currentUser.id },
    },
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