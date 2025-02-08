import React from "react";
import { TextShimmer } from "../ui/text-shimmer";

interface MovingShadowButtonProps {
  children: React.ReactNode;
}

const CustomButton: React.FC<MovingShadowButtonProps> = ({ children }) => {
  return (
    <button
      type="submit"
      className="relative px-6 py-3 bg-slate-50 text-black text-sm md:text-lg rounded-full shadow-lg transition-transform transform focus:outline-none focus:ring-offset-2 group hover:scale-105 hover:shadow-xl hover:shadow-slate-300/50 active:scale-95 active:shadow-sm active:shadow-slate-300/50 disabled:opacity-50 disabled:pointer-events-none duration-300"
    >
      <TextShimmer duration={4}>{children}</TextShimmer>
    </button>
  );
};

export default CustomButton;
