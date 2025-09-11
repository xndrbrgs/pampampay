import React from "react";
import {
  CardContent,
  CardHeader,
  CardTitle,
  Card,
  CardDescription,
} from "../ui/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const VideoExplanation = () => {
  return (
    <Accordion
      className="border bg-white/10 border-gray-600 rounded-xl shadow-lg mt-3 max-w-7xl"
      type="single"
      collapsible
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="flex items-center space-x-3 text-lg md:text-xl lg:text-2xl leading-none tracking-tight p-6 no-underline">
          How To Deposit BTC via CashApp?
        </AccordionTrigger>
        <AccordionContent>
          <video
            src="/video/PPPBtc.mov"
            style={{ width: "100%", maxHeight: "500px" }}
            controls
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default VideoExplanation;
