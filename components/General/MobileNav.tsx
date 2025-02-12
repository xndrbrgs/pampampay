import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";
import SidebarLinks from "../Dashboard/SidebarLinks";
import MyConnections from "./MyConnections";
import { SignedIn, UserButton, SignOutButton  } from "@clerk/nextjs";
import Logout from "../Dashboard/Logout";
import { VisuallyHidden } from "radix-ui";

const MobileNav = () => {
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
            <SidebarLinks />
            <MyConnections />
          </div>
          <div className="border-t border-gray-800 pt-4">
            <SignedIn>
              <div className="flex items-center space-x-3">
                <UserButton />
                <div className="flex space-x-2">
                  <Logout />
                  <SignOutButton />
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
