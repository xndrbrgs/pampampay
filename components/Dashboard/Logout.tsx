"use client";

import { useUser } from "@clerk/nextjs";

const Logout = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <section>
      <div className="flex flex-col">
        <p className="text-sm">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-400">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>
    </section>
  );
};

export default Logout;
