"use client";

import { Users } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Disclosure,
  DisclosureTrigger,
  DisclosureContent,
} from "../ui/disclosure";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface RealtimeConnectProps {
  user: {
    firstName?: string;
    username: string;
  };
  connections: Array<{
    id: string;
    profileImage: string;
    username: string;
    customId: string;
    // other connection properties
  }>;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const RealtimeConnect = ({ user, connections }: RealtimeConnectProps) => {
  const supabaseClient = createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  const router = useRouter();

  useEffect(() => {
    const channel = supabaseClient
      .channel("table-connection-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Connection",
        },
        (payload) => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [router, supabaseClient]);

  return (
    <div>
      <div className="flex text-md space-x-3">
        <Users size={20} />
        <span>
          {user.firstName ? user.firstName : user.username}'s Connections
        </span>
      </div>
      <div className="mt-3 flex flex-col space-y-2 overflow-auto max-h-72 md:max-h-96">
        {connections.map((connection) => (
          <div key={connection.id}>
            <Disclosure className="w-full md:side-width rounded-md border border-zinc-200 px-3 dark:border-zinc-700">
              <DisclosureTrigger>
                <div className="flex items-center overflow-hidden">
                  <div className="relative rounded-full w-8 h-8 overflow-hidden">
                    <Image
                      src={connection.profileImage || "/default-profile.png"}
                      alt={connection.username || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex p-2 scale-100 md:scale-90 lg:scale-100">
                    <div className="flex flex-col">
                      <span className="text-sm">{connection.username}</span>
                      <span className="text-xs text-gray-400 truncate">
                        {connection.customId}
                      </span>
                    </div>
                  </div>
                </div>
              </DisclosureTrigger>
              <DisclosureContent>
                <div className="overflow-hidden py-3 mx-auto justify-center flex w-full">
                  <Button>
                    <Link href="/dashboard/pay-and-request">
                      Perform Transfer
                    </Link>
                  </Button>
                </div>
              </DisclosureContent>
            </Disclosure>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealtimeConnect;
