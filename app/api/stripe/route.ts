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

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not set.');
        return new Response('Stripe webhook error: Missing webhook secret', { status: 500 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );

    } catch (error: any) {
        console.error('Stripe webhook error:', error.message);
        return new Response('Stripe webhook error', { status: 400 });

    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;

            if (session.id) {
                try {
                    await prisma.transfer.update({
                        where: {
                            id: session.id
                        },
                        data: {
                            status: 'COMPLETED',
                        }
                    });
                    console.log(`Updated transfer status to COMPLETED for session ${session.id}`);
                } catch (prismaError: any) {
                    console.error('Prisma update error:', prismaError.message);
                    // Consider a more specific error response if the update fails
                }
            } else {
                console.warn('Session ID is missing in the event data.');
            }

            break;
        }
        default: {
            console.log('unhandled event', event.type, event);
        }
    }


    return new Response(null, { status: 200 });
}
