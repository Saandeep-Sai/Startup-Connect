"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { db } from "@/firebase";
import { doc, getDoc, collection, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader2, MessageCircle, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const uid = typeof params?.uid === "string" ? params.uid : null;

  useEffect(() => {
    if (authLoading || !user || !uid) {
      if (!authLoading && !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view profiles.",
          variant: "destructive",
        });
        router.push("/login");
      } else if (!uid) {
        toast({
          title: "Invalid Profile",
          description: "User ID is missing.",
          variant: "destructive",
        });
        router.push("/dashboard");
      }
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for user:", uid);
        const userDoc = await getDoc(doc(db, "users", uid));
        if (!userDoc.exists()) {
          console.log("User not found:", uid);
          toast({
            title: "User Not Found",
            description: "This user does not exist.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }

        setProfile(userDoc.data() as UserData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, uid, router, toast]);

  const handleConnect = () => {
    // Placeholder for connect functionality (e.g., friend request, follow)
    console.log("Connect request sent to:", uid);
    toast({
      title: "Connect Request",
      description: "Connect functionality is not yet implemented.",
    });
  };

  const handleStartChat = async () => {
    if (!user || !uid) {
      console.log("Cannot start chat: user or uid missing", { user, uid });
      toast({
        title: "Error",
        description: "Please log in to start a chat.",
        variant: "destructive",
      });
      return;
    }
    if (uid === user.uid) {
      console.log("User attempted to chat with self");
      toast({
        title: "Invalid Action",
        description: "You cannot chat with yourself.",
        variant: "destructive",
      });
      return;
    }
    try {
      console.log("Starting chat with user:", uid, "with message:", chatMessage);
      const chatRef = doc(collection(db, "chats"));
      await setDoc(chatRef, {
        participants: [user.uid, uid],
        itemId: null, // No specific post
        itemType: null, // No specific type
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "chats", chatRef.id, "messages"), {
        senderId: user.uid,
        text: chatMessage,
        timestamp: serverTimestamp(),
      });

      console.log("Chat created with ID:", chatRef.id);
      toast({
        title: "Chat Started",
        description: "Your message has been sent.",
      });
      setChatMessage("");
      setShowChatModal(false);
      router.push(`/dashboard/chats/${chatRef.id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openChatModal = () => {
    if (!user) {
      console.log("User not logged in, redirecting to login");
      toast({
        title: "Authentication Required",
        description: "Please log in to start a chat.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    if (uid === user.uid) {
      console.log("User attempted to chat with self");
      toast({
        title: "Invalid Action",
        description: "You cannot chat with yourself.",
        variant: "destructive",
      });
      return;
    }
    console.log("Opening chat modal for user:", uid);
    setShowChatModal(true);
  };

  if (isLoading || authLoading || !user || !uid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Profile not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900"
    >
      <Card variant="elevated" className="hover:shadow-2xl transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/images/avatar.png" alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback>{profile.firstName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{`${profile.firstName} ${profile.lastName}`}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{profile.role}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300"><strong>Email:</strong> {profile.email}</p>
            <p className="text-gray-600 dark:text-gray-300"><strong>Role:</strong> {profile.role}</p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={handleConnect}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Connect
          </Button>
          <Button
            variant="outline"
            className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={openChatModal}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
        </CardFooter>
      </Card>

      {showChatModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card variant="elevated" className="p-6 max-w-md w-full">
            <CardHeader>
              <CardTitle>Start a Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={chatMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatMessage(e.target.value)}
                placeholder="Type your initial message..."
                variant="outline"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowChatModal(false);
                  setChatMessage("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartChat}
                disabled={!chatMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Send
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}