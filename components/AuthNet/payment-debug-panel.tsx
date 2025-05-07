"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, ChevronUp, Bug } from "lucide-react";

interface LogEntry {
  timestamp: string;
  method: string;
  level: string;
  message: string;
  data?: any;
}

export function PaymentDebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Override console.log to capture payment logs
    const originalConsoleLog = console.log;

    console.log = (...args) => {
      // Call the original console.log
      originalConsoleLog.apply(console, args);

      // Check if this is a payment log
      const firstArg = args[0];
      if (
        (typeof firstArg === "string" && firstArg.includes("[PAYMENT:")) ||
        firstArg.includes("[SERVER:PAYMENT:")
      ) {
        try {
          // Parse the log message
          const logRegex =
            /\[(.*?)\] \[(SERVER:)?PAYMENT:(.*?)\] \[(.*?)\] (.*)/;
          const matches = firstArg.match(logRegex);

          if (matches) {
            const [, timestamp, , method, level, message] = matches;

            // Get additional data if available
            const data = args.length > 1 ? args[1] : undefined;

            // Add to logs
            setLogs((prevLogs) =>
              [{ timestamp, method, level, message, data }, ...prevLogs].slice(
                0,
                100
              )
            ); // Keep only the last 100 logs
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    };

    // Restore original console.log on cleanup
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "INFO":
        return "bg-blue-500";
      case "WARNING":
        return "bg-yellow-500";
      case "ERROR":
        return "bg-red-500";
      case "SUCCESS":
        return "bg-green-500";
      case "DEBUG":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 z-50 w-96 shadow-lg ${
        isMinimized ? "h-auto" : "h-96"
      }`}
    >
      <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">
          Payment Debug Console
        </CardTitle>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={clearLogs}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-3">
          <ScrollArea className="h-72">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No payment logs yet. Try making a payment.
                </p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-xs border rounded-md p-2">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {log.method}
                      </Badge>
                      <Badge
                        className={`text-[10px] text-white ${getLevelColor(
                          log.level
                        )}`}
                      >
                        {log.level}
                      </Badge>
                    </div>
                    <p className="font-medium mb-1">{log.message}</p>
                    <p className="text-muted-foreground text-[10px]">
                      {log.timestamp}
                    </p>
                    {log.data && (
                      <pre className="mt-1 bg-muted p-1 rounded text-[10px] overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
