import { createOrGetUser, getConnections } from "@/lib/actions/user.actions";
import { Users } from "lucide-react";
import { DisclosureTab } from "./Disclosure";

const MyConnections = async () => {
  const user = await createOrGetUser();
  const connections = await getConnections();
  return (
    <section className="w-full border-t border-gray-800 pt-4">
      <div className="flex text-md space-x-3">
        <Users size={20} />
        <span>
          {user.firstName ? user.firstName : user.username}'s Connections
        </span>
      </div>
      <div className="mt-3 flex flex-col space-y-2 overflow-auto max-h-72 md:max-h-96">
        {connections.map((connection) => (
          <div key={connection.id}>
            <DisclosureTab connection={connection} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MyConnections;
