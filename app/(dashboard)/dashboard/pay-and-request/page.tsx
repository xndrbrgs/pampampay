import Header from "@/components/General/Header";
import { getConnections } from "@/lib/actions/user.actions";
import { TransferForm } from "@/components/General/TransferForm";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

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
        <TransferForm connections={connections} />
      </div>
    </section>
  );
}
