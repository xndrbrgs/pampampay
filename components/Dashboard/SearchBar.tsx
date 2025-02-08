"use client";

import { Command, Search } from "lucide-react";
import { useState } from "react";
import { CommandMenu } from "./CommandMenu";

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-neutral-200 mb-4 relative rounded flex items-center px-2 py-1.5 text-sm text-black">
        <Search size={16} className="mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent w-full placeholder:text-gray-700 focus:outline-none"
          onFocus={(e) => {
            e.target.blur();
            setOpen(true);
          }}
        />
        <span className="flex items-center text-gray-700 bg-neutral-50 p-1 rounded shadow">
          <Command size={16} className="mr-0.5" />K
        </span>
      </div>

      <CommandMenu open={open} setOpen={setOpen} />
    </>
  );
};

export default SearchBar;
