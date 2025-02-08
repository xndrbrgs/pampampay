import Header from "@/components/General/Header";
import { getConnections } from "@/lib/actions/user.actions";
import { TransferForm } from "@/components/General/TransferForm";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import {
  createStripeAccountLink,
  getStripeDashboard,
} from "@/lib/actions/transfer.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getUserData(userId: string) {
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

export default async function TransferPage() {
  const connections = await getConnections();

  const user = await currentUser();
  if (!user) {
    return <div>User not found</div>;
  }

  const data = await getUserData(user.id);

  return (
    <section className="p-6 h-screen">
      <Header
        title="Transfer Money"
        subtext="Manage your transfers easily and safely."
      />
      <div className="flex flex-col gap-4 max-w-3xl">
        {data?.stripeConnectedLinked === false && (
          <div className="mt-5">
            <Card className="card-style">
              <CardHeader>
                <CardTitle>Link Your Account to Stripe</CardTitle>
                <CardDescription>
                  Link your account to Stripe to begin receiving payments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createStripeAccountLink}>
                  <Button type="submit">Click To Link Account</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {data?.stripeConnectedLinked === true && (
          <div className="mt-5">
            <Card className="card-style">
              <CardHeader>
                <CardTitle>View Your Account Dashboard</CardTitle>
                <CardDescription>
                  View your Stripe account dashboard for more payment details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={getStripeDashboard}>
                  <Button type="submit">Click To View Dashboard</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <TransferForm connections={connections} />
      </div>
    </section>
  );
}
