import Link from "next/link";
import {
  Disclosure,
  DisclosureTrigger,
  DisclosureContent,
} from "../ui/disclosure";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function DisclosureTab({ connection }: any) {
  return (
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
            <Link href="/dashboard/pay-and-request">Perform Transfer</Link>
          </Button>
        </div>
      </DisclosureContent>
    </Disclosure>
  );
}
