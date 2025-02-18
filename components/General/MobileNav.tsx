import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import SidebarLinks from "../Dashboard/SidebarLinks";
import MyConnections from "./MyConnections";
import { SignedIn, SignOutButton, UserButton } from "@clerk/nextjs";
import Logout from "../Dashboard/Logout";
import { VisuallyHidden } from "radix-ui";
import { LogOut, Menu } from "lucide-react";
interface SidebarProps {
  stripeConnected: boolean;
}

const MobileNav: React.FC<SidebarProps> = ({ stripeConnected }) => {
  return (
    <Sheet>
      <SheetTrigger>
        {/* <HamburgerMenu /> */}
        <Menu />
      </SheetTrigger>
      <SheetContent side={"left"}>
        <VisuallyHidden.Root>
          <SheetTitle>Menu</SheetTitle>
        </VisuallyHidden.Root>
        <section className="flex justify-between flex-col h-full">
          <div className="flex flex-col space-y-4">
            <div className="relative flex items-center pr-3 pb-3 border-b border-gray-800">
              <div className="relative h-7 w-7">
                <Image src="/images/iconsvg.svg" alt="logo" fill />
              </div>
              <span className="font-editorial text-md pt-1 pl-2">
                PamPamPay
              </span>
            </div>
            <SidebarLinks stripeConnectedLinked={stripeConnected} />
            <MyConnections />
          </div>
          <div className="border-t border-gray-800 pt-4">
            <SignedIn>
              <div className="flex justify-between items-center px-3">
                <div className="flex items-center space-x-3">
                  <UserButton />
                  <Logout />
                </div>
                <div className="text-red-400 size-3">
                  <SignOutButton>
                    <LogOut />
                  </SignOutButton>
                </div>
              </div>
            </SignedIn>
          </div>
        </section>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
