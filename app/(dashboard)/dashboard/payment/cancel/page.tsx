import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const CancelPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }
  return (
    <section className="w-full flex items-center h-screen justify-center">
      <Card className="card-width card-style">
        <CardHeader className="text-center">
          <CardTitle>
            <h1 className="text-xl">Payment Cancelled</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <XCircle className="w-24 h-24 text-red-500 rounded-full bg-red-500/30 p-2 mx-auto" />
          <div className="flex flex-col space-y-5">
            <p className="text-center text-sm">
              Something went wrong with your payment. <br /> Please try again
              later.
            </p>
            <Link href="/dashboard/pay-and-request">
              <p className="text-center hover:underline transition duration-150 text-md">
                Click here to go back to payments
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default CancelPage;
