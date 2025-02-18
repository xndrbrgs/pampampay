import Header from "@/components/General/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createStripeAccountLink,
  getStripeDashboard,
} from "@/lib/actions/transfer.actions";
import {
  createOrGetUser,
  getStripeConnnectUser,
} from "@/lib/actions/user.actions";

const AuthTransfer = async () => {
  const user = await createOrGetUser();
  const data = await getStripeConnnectUser(user.clerkUserId);
  return (
    <section className="p-6 h-screen">
      <Header
        title="Authorize Transfer"
        subtext="Create your Stripe Connect account to begin accepting payments"
      />
      <div className="max-w-3xl">
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
      </div>
    </section>
  );
};

export default AuthTransfer;
