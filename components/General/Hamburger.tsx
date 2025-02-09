"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const FallbackMenu = () => {
  return (
    <div className="text-center text-gray-500">
      <p>Menu</p>
    </div>
  );
};

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to true for mobile
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if the window is mobile-sized
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If not mobile, render the fallback
  if (!isMobile) {
    return <FallbackMenu />;
  }

  return (
    <div
      ref={menuRef}
      onClick={() => setIsOpen(!isOpen)}
      className="relative w-6 h-6 flex items-center justify-center"
    >
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Line */}
        <motion.line
          x1="4"
          y1="6"
          x2="20"
          y2="6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          animate={
            isOpen
              ? { x2: 12, y1: 12, y2: 12 } // Move to center
              : { x2: 20, y1: 6, y2: 6 } // Original position
          }
          transition={{ duration: 0.3 }}
        />
        {/* Middle Line */}
        <motion.line
          x1="4"
          y1="12"
          x2="20"
          y2="12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
        {/* Bottom Line */}
        <motion.line
          x1="4"
          y1="18"
          x2="20"
          y2="18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          animate={
            isOpen
              ? { x2: 12, y1: 12, y2: 12 } // Move to center
              : { x2: 20, y1: 18, y2: 18 } // Original position
          }
          transition={{ duration: 0.3 }}
        />
      </motion.svg>
    </div>
  );
};

export default HamburgerMenu;
