import Link from "next/link";
import {
  Disclosure,
  DisclosureTrigger,
  DisclosureContent,
} from "../ui/disclosure";
import { Button } from "@/components/ui/button";

export function DisclosureTab({ connection }: any) {
  return (
    <Disclosure className="w-full md:side-width rounded-md border border-zinc-200 px-3 dark:border-zinc-700">
      <DisclosureTrigger>
        <div className="flex space-x-2 p-2 scale-100 md:scale-90 lg:scale-100">
          <img
            src={connection.profileImage || "/default-profile.png"}
            alt={connection.firstName || "User"}
            className="h-8 w-8 rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-sm">
              {connection.firstName && connection.lastName
              ? `${connection.firstName} ${connection.lastName}`
              : connection.username}
            </span>
            <span className="text-xs text-gray-400">{connection.email}</span>
          </div>
        </div>
      </DisclosureTrigger>
      <DisclosureContent>
        <div className="overflow-hidden py-3 mx-auto justify-center flex w-full">
          <Button>
            <Link href="/dashboard/pay-and-request">Perform Transfer</Link>
          </Button>
        </div>
      </DisclosureContent>
    </Disclosure>
  );
}
