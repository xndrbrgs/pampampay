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
    // <Card className="border bg-white/10 border-gray-600 rounded-xl shadow-lg mt-3 max-w-7xl">
    //   <section>
    //     <CardHeader className="border-b border-gray-600">
    //       <CardTitle className="text-2xl md:text-3xl flex items-center space-x-3">
    //         <span>How To Deposit BTC via CashApp?</span>
    //       </CardTitle>
    //       <CardDescription className="text-sm text-gray-400">
    //         This video explains how to deposit BTC via CashApp for fast and easy
    //         payments.
    //       </CardDescription>
    //     </CardHeader>
    //     <CardContent>
    //       <video
    //         src="/video/PPPBtc.mov"
    //         style={{ width: "100%", maxHeight: "500px" }}
    //         controls
    //       />
    //     </CardContent>
    //   </section>
    // </Card>
  );
};

export default VideoExplanation;
