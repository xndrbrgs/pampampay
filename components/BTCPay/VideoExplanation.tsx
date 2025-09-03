import React from "react";
import {
  CardContent,
  CardHeader,
  CardTitle,
  Card,
  CardDescription,
} from "../ui/card";

const VideoExplanation = () => {
  return (
    <Card className="border bg-white/10 border-gray-600 rounded-xl shadow-lg mt-3 max-w-7xl">
      <section>
        <CardHeader className="border-b border-gray-600">
          <CardTitle className="text-2xl md:text-3xl flex items-center space-x-3">
            <span>How To Deposit BTC via CashApp?</span>
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            This video explains how to deposit BTC via CashApp for fast and easy
            payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <video
            src="/video/PPPBtc.mov"
            style={{ width: "100%", maxHeight: "500px" }}
            controls
          />
        </CardContent>
      </section>
    </Card>
  );
};

export default VideoExplanation;
