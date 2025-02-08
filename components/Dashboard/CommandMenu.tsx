"use client";

import { Command } from "cmdk";
import { CircleHelp } from "lucide-react";
import { useEffect, useState } from "react";
import { DialogTitle, type DialogProps } from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SignOutDialog } from "./SignOutDialog";

export const CommandMenu = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [value, setValue] = useState("");

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          label="Global Command Menu"
        >
          <motion.div
            className="fixed inset-0 bg-black/70" // Background overlay
            initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }} // Initial background color
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }} // Animate to this color
            exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }} // Exit color
            transition={{ duration: 0.2 }} // Transition duration
            onClick={() => setOpen(false)} // Close on background click
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl border-stone-300 border overflow-hidden w-full max-w-lg mx-auto mt-16"
              initial={{ opacity: 0, y: -20 }} // Initial state
              animate={{ opacity: 1, y: 0 }} // Animate to this state
              exit={{ opacity: 0, y: -20 }} // Exit state
              transition={{ duration: 0.2 }} // Transition duration
            >
              <DialogTitle></DialogTitle>
              <Command.Input
                placeholder="What did you want to search?"
                className="relative border-b border-stone-300 p-3 text-lg w-full placeholder:text-stone-400 focus:outline-none text-black"
                value={value}
                onValueChange={setValue}
              />
              <Command.List className="p-3">
                <Command.Empty className="text-black p-2">
                  No results found for
                  <span className="text-red-500">"{value}"</span>
                </Command.Empty>

                <Command.Group
                  className="text-stone-400 text-sm"
                  heading="Payments"
                >
                  <div className="text-stone-950 text-md py-2">
                    <Command.Item>
                      <Link href="/dashboard/pay-and-request">
                        <div className="flex cursor-pointer transition-colors p-2 hover:bg-stone-200 rounded items-center gap-2">
                          <CircleHelp size={20} />
                          Where can I start sending transfers?
                        </div>
                      </Link>
                    </Command.Item>
                    <Command.Item>
                      <Link href="/dashboard/transactions">
                        <div className="flex cursor-pointer transition-colors p-2 hover:bg-stone-200 rounded items-center gap-2">
                          <CircleHelp size={20} />
                          Where can I find my payment history?
                        </div>
                      </Link>
                    </Command.Item>
                  </div>
                </Command.Group>
                <Command.Separator />

                <Command.Group
                  className="text-stone-400 text-sm"
                  heading="Settings"
                >
                  <div className="text-stone-950 text-md py-2">
                    <Command.Item className="flex cursor-pointer transition-colors p-2 hover:bg-stone-200 rounded items-center gap-2">
                      <CircleHelp size={20} />
                      <SignOutDialog />
                    </Command.Item>
                  </div>
                </Command.Group>

                <Command.Item>Apple</Command.Item>
              </Command.List>
            </motion.div>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
};
