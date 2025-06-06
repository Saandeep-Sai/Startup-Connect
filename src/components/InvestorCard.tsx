"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface InvestorCardProps {
  id: string;
  name: string;
  photoURL?: string;
  onSendRequest: (investorId: string) => void;
  requestStatus?: "pending" | "accepted" | "rejected";
}

export function InvestorCard({
  id,
  name,
  photoURL,
  onSendRequest,
  requestStatus,
}: InvestorCardProps) {
  const getButtonText = () => {
    if (requestStatus === "pending") return "Request Pending";
    if (requestStatus === "accepted") return "Accepted";
    if (requestStatus === "rejected") return "Send Request";
    return "Send Request";
  };

  const getButtonStyles = () => {
    if (requestStatus === "pending")
      return "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed";
    if (requestStatus === "accepted")
      return "bg-green-500 dark:bg-green-600 text-white cursor-not-allowed";
    return "bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white";
  };

  return (
    <Card
      variant="elevated"
      className="p-6 bg-white dark:bg-gray-800 card-hover"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={photoURL || "/images/avatar.png"} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {name}
        </h3>
        <Button
          onClick={() => !requestStatus || requestStatus === "rejected" ? onSendRequest(id) : null}
          className={`ml-auto flex items-center justify-center gap-2 text-sm ${getButtonStyles()}`}
          disabled={requestStatus === "pending" || requestStatus === "accepted"}
        >
          <span>{getButtonText()}</span>
        </Button>
      </div>
    </Card>
  );
}