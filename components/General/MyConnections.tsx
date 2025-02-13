import { createOrGetUser, getConnections } from "@/lib/actions/user.actions";
import RealtimeConnect from "./RealtimeConnect";

const MyConnections = async () => {
  const user = await createOrGetUser();
  const connections = await getConnections();
  return (
    <section className="w-full border-t border-gray-800 pt-4">
      <RealtimeConnect user={user} connections={connections} />
    </section>
  );
};

export default MyConnections;
