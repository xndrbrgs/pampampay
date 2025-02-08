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
        <span>{user.firstName}'s Connections</span>
      </div>
      <div className="mt-3 overflow-y-scroll">
        {connections.map((connection) => (
          <div key={connection.id} className="flex space-x-2">
            <DisclosureTab connection={connection} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MyConnections;
