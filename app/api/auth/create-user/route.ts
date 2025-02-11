import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateUsername } from 'friendly-username-generator';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return new NextResponse(`Unathorized`, { status: 401 });
    }

    // Get user info
    const user = await currentUser();

    if (!user) {
        return new NextResponse(`User doesn't exist`, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
        where: {
            clerkUserId: user.id,
        },
    });

    if (!dbUser) {
        const stripeAccount = await stripe.accounts.create({
            email: user.emailAddresses[0].emailAddress ?? '',
            controller: {
                losses: {
                    payments: 'application'
                },
                fees: {
                    payer: 'application'
                },
                stripe_dashboard: {
                    type: 'express'
                }
            }

        });


        const userData = {
            clerkUserId: user?.id ?? '',
            customId: uuidv4(),
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            email: (user?.emailAddresses && user.emailAddresses.length > 0)
                ? user.emailAddresses[0].emailAddress
                : '',
            profileImage: `https://picsum.photos/seed/${user?.id}/200/300`,
            username: user?.username ?? generateUsername(),
            connectedAccountId: stripeAccount?.id ?? '',
            stripeConnectedLinked: false
        };

        // Log the userData object
        console.log('User Data:', userData);

        const dbUser = await prisma.user.create({
            data: userData,
        });

        

    }

    // Perform redirect with returned user object

    return new NextResponse(null, {
        status: 302,
        headers: {
            Location: '/dashboard',
        },
    })
}