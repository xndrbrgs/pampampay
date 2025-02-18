import { SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";
import Logout from "./Logout";
import SidebarLinks from "./SidebarLinks";
import SearchBar from "./SearchBar";
import MyConnections from "../General/MyConnections";

interface SidebarProps {
  stripeConnected: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ stripeConnected }) => {
  return (
    <section className="hidden md:flex side-width sticky justify-between flex-col top-4 h-screen p-6 border-r">
      <div className="flex flex-col space-y-4">
        <div className="relative flex items-center text-center border-b border-gray-800 space-x-2 pb-3">
          <div className="relative h-6 w-6">
            <Image
              src="/images/iconsvg.svg"
              alt="logo"
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>
          <span className="font-editorial text-lg pt-[0.25rem]">PamPamPay</span>
        </div>
        <SearchBar />
        <SidebarLinks stripeConnectedLinked={stripeConnected} />
        <MyConnections />
      </div>
      <div className="border-t border-gray-800 pt-4 mb-8">
        <SignedIn>
          <div className="flex items-center space-x-3">
            <UserButton />
            <div>
              <Logout />
            </div>
          </div>
        </SignedIn>
      </div>
    </section>
  );
};

export default Sidebar;
