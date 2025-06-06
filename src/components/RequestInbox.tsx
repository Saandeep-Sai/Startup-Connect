"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  verified?: boolean;
}

interface Request {
  requestId: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp | null;
}

interface RequestInboxProps {
  requests: Request[];
  userCache: Map<string, User>;
  onAction: (
    requestId: string,
    status: "accepted" | "rejected"
  ) => Promise<void>;
}

const requestVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function RequestInbox({
  requests,
  userCache,
  onAction,
}: RequestInboxProps) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    setProcessing(requestId);
    try {
      await onAction(requestId, status);
    } catch (err) {
      console.error(`Error ${status} request:`, err);
      toast({
        title: "Error",
        description: `Failed to ${status} request.`,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Connection Requests
      </h2>
      {requests.length === 0 ? (
        <p className="text-center text-lg text-gray-600 dark:text-gray-300">
          No pending requests.
        </p>
      ) : (
        requests.map((request, index) => (
          <motion.div
            key={request.requestId}
            variants={requestVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">
                  From: {userCache.get(request.senderId)?.name || "Unknown"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Status: {request.status}
                </p>
                {request.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() =>
                        handleAction(request.requestId, "accepted")
                      }
                      disabled={processing === request.requestId}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 to-green-700 text-white"
                    >
                      {processing === request.requestId
                        ? "Processing..."
                        : "Accept"}
                    </Button>
                    <Button
                      onClick={() =>
                        handleAction(request.requestId, "rejected")
                      }
                      disabled={processing === request.requestId}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      {processing === request.requestId
                        ? "Processing..."
                        : "Reject"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
