// BrowserCard.tsx
import React from "react";
import { Tilt } from "../ui/tilt";
import Image from "next/image";

interface BrowserCardProps {
  imageSrc: string;
  altText: string;
}

const BrowserCard: React.FC<BrowserCardProps> = ({ imageSrc, altText }) => {
  return (
    <Tilt rotationFactor={8} isRevese>
      <div
        style={{
          borderRadius: "12px",
        }}
        className="flex flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900"
      >
        {/* Image Container */}
        <div className="relative h-[20rem] lg:h-[36rem] w-full rounded-md overflow-hidden">
          <Image
            src={imageSrc} // Use the passed image source
            alt={altText} // Use the passed alt text
            fill
            className="object-cover"
          />
        </div>
      </div>
    </Tilt>
  );
};

export default BrowserCard;
