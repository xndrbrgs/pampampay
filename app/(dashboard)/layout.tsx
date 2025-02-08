import Sidebar from "@/components/Dashboard/Sidebar";
import MobileNav from "@/components/General/MobileNav";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }
  return (
    <main className="relative w-full">
      <div className="flex h-full">
        <div className="hidden md:block sticky top-0 left-0">
          <Sidebar />
        </div>
        <div className="flex-1 h-full bg-[radial-gradient(circle_at_95%_0%,_#550000_0%,_rgba(85,0,0,0.4)_30%,_#0a0a0a_80%)]">
          <div className="sticky top-0 z-50 backdrop-blur-xl shadow-lg">
            <div className="md:hidden flex justify-between items-center p-4">
              <div className="relative flex items-center">
                <div className="relative h-7 w-7">
                  <Image
                    src="/images/iconsvg.svg"
                    alt="logo"
                    fill
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>
                <span className="font-editorial text-lg pt-1 pl-2">PamPamPay</span>
              </div>
              <MobileNav />
            </div>
          </div>
          <div className="h-full">{children}</div>
        </div>
      </div>
    </main>
  );
}
