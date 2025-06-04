"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { db } from "@/firebase";
import { collection, query, orderBy, getDoc, doc, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Timestamp;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [otherParticipantName, setOtherParticipantName] = useState("Unknown");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = typeof params?.id === "string" ? params.id : null;

  useEffect(() => {
    if (authLoading || !user || !chatId) {
      if (!authLoading && !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view this chat.",
          variant: "destructive",
        });
        router.push("/login");
      } else if (!chatId) {
        toast({
          title: "Invalid Chat",
          description: "Chat ID is missing.",
          variant: "destructive",
        });
        router.push("/dashboard/chats");
      }
      return;
    }

    const fetchChat = async () => {
      try {
        console.log("Fetching chat with ID:", chatId, "for user:", user.uid);
        const chatDoc = await getDoc(doc(db, "chats", chatId));
        if (!chatDoc.exists()) {
          console.log("Chat not found:", chatId);
          toast({
            title: "Chat Not Found",
            description: "This chat does not exist.",
            variant: "destructive",
          });
          router.push("/dashboard/chats");
          return;
        }

        const chatData = chatDoc.data();
        if (!chatData.participants.includes(user.uid)) {
          console.log("User not a participant in chat:", chatData.participants);
          toast({
            title: "Access Denied",
            description: "You are not a participant in this chat.",
            variant: "destructive",
          });
          router.push("/dashboard/chats");
          return;
        }

        const otherParticipant = chatData.participants.find((uid: string) => uid !== user.uid);
        if (otherParticipant) {
          const userDoc = await getDoc(doc(db, "users", otherParticipant));
          const name = userDoc.exists()
            ? userDoc.data().firstName && userDoc.data().lastName
              ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
              : `User_${otherParticipant.slice(0, 8)}`
            : `User_${otherParticipant.slice(0, 8)}`;
          console.log("Other participant:", name);
          setOtherParticipantName(name);
        }

        const messagesQuery = query(
          collection(db, "chats", chatId, "messages"),
          orderBy("timestamp", "asc")
        );
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messagesData: Message[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as Message));
          console.log("Received messages:", messagesData);
          setMessages(messagesData);
          setIsLoading(false);
        }, (error) => {
          console.error("Error listening to messages:", error);
          toast({
            title: "Error",
            description: "Failed to load messages. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching chat:", error);
        toast({
          title: "Error",
          description: "Failed to load chat. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchChat();
  }, [user, authLoading, chatId, router, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user) {
      console.log("Cannot send message: invalid input", { newMessage, chatId, user });
      toast({
        title: "Invalid Message",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Sending message:", newMessage);
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: newMessage,
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || authLoading || !user || !chatId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 p-6 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/images/avatar.png" alt={otherParticipantName} />
          <AvatarFallback>{otherParticipantName[0]}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Chat with {otherParticipantName}
        </h1>
      </div>
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                    message.senderId === user.uid
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {message.timestamp?.toDate().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <form
        onSubmit={handleSendMessage}
        className="mt-4 flex items-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
      >
        <Input
          type="text"
          value={newMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          variant="outline"
          className="flex-1"
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </motion.div>
  );
}