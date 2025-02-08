"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRightLeft, HandCoins, House } from "lucide-react";

export const sidebarLinks = [
  {
    route: "/dashboard",
    label: "Dashboard",
    icon: <House size={20} />,
  },
  {
    route: "/dashboard/pay-and-request",
    label: "Pay & Request",
    icon: <HandCoins size={20} />,
  },
  {
    route: "/dashboard/transactions",
    label: "Transactions",
    icon: <ArrowRightLeft size={20} />,
  },
];

const SidebarLinks = () => {
  const pathname = usePathname();

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  return (
    <motion.div
      className="flex flex-col space-y-5 py-4"
      initial="hidden"
      animate="visible"
      variants={listVariants}
    >
      {sidebarLinks.map((link) => {
        const isActive =
          pathname === link.route ||
          pathname.startsWith(`/dashboard/${link.route}/`);
        return (
          <motion.div variants={itemVariants} key={link.label}>
            <Link
              href={link.route}
              key={link.label}
              className={cn(
                "navbar-link text-gray-400 hover:text-white transition duration-150",
                { "text-white": isActive }
              )}
            >
              <div className="flex space-x-3 items-center">
                <span className="text-sm">{link.icon}</span>
                <p>{link.label}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default SidebarLinks;
