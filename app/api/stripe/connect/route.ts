import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const body = await req.text();

    const signature = (await headers()).get("Stripe-Signature");

    if (!signature) {
        console.error('Stripe-Signature header is missing.');
        return new Response('Stripe webhook error: Missing signature', { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_USER_CONNECT_WEBHOOK_OFFICIAL;

    if (!webhookSecret) {
        console.error('STRIPE_USER_CONNECT_WEBHOOK_OFFICIAL is not set.');
        return new Response('Stripe webhook error: Missing webhook secret', { status: 500 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );

        console.log(`Received Stripe Connect event: ${event.type}`);

    } catch (error: any) {
        console.error('Stripe webhook error:', error.message, error);
        return new Response('Stripe webhook error', { status: 400 });
    }

    switch (event.type) {
        case "account.updated": {
            const account = event.data.object;

            if (account.id) {
                try {
                    await prisma.user.update({
                        where: {
                            connectedAccountId: account.id
                        },
                        data: {
                            stripeConnectedLinked: account.capabilities?.transfers === "pending" || account.capabilities?.transfers === "inactive" ? false : true
                        }
                    });
                    console.log(`Updated user account status for ${account.id}`);
                } catch (prismaError: any) {
                    console.error('Prisma update error:', prismaError.message);
                    // Consider a more specific error response if the update fails
                }
            } else {
                console.warn('Account ID is missing in the event data.');
            }

            break;
        }
        default: {
            console.log('unhandled event', event.type, event);
        }
    }

    return new Response(null, { status: 200 });
}
