/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";

interface Chat {
  id: string;
  participants: string[];
  itemId?: string;
  itemType?: "startup" | "investment";
  lastMessage?: string;
  lastMessageTime?: Timestamp;
}

interface User {
  name: string;
  photoURL?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] } },
};

const featureCardVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  hover: { y: -10, scale: 1.05, transition: { duration: 0.3 } },
};

export default function ChatsPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your chats.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    const fetchChats = async () => {
      try {
        console.log("Fetching chats for user:", user.uid);
        const chatsQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid)
        );
        const chatsSnapshot = await getDocs(chatsQuery);
        const chatsData: Chat[] = [];
        const userIdsToFetch = new Set<string>();

        for (const chatDoc of chatsSnapshot.docs) {
          const chatData = { id: chatDoc.id, ...chatDoc.data() } as Chat;
          chatsData.push(chatData);
          const otherParticipant = chatData.participants.find(
            (uid) => uid !== user.uid
          );
          if (otherParticipant && !userCache.has(otherParticipant)) {
            userIdsToFetch.add(otherParticipant);
          }

          const messagesQuery = query(
            collection(db, "chats", chatDoc.id, "messages"),
            orderBy("timestamp", "desc"),
            limit(1)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          if (!messagesSnapshot.empty) {
            const lastMessage = messagesSnapshot.docs[0].data();
            chatData.lastMessage = lastMessage.text;
            chatData.lastMessageTime = lastMessage.timestamp;
          }
        }

        const userPromises = Array.from(userIdsToFetch).map(async (uid) => {
          try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (!userDoc.exists()) {
              console.warn(`User document not found for UID: ${uid}`);
              return { uid, data: { name: `User_${uid.slice(0, 8)}` } as User };
            }
            const userData = userDoc.data();
            return {
              uid,
              data: {
                name:
                  userData.firstName && userData.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : `User_${uid.slice(0, 8)}`,
                photoURL: userData.photoURL,
              } as User,
            };
          } catch (error) {
            console.error(`Error fetching user ${uid}:`, error);
            return { uid, data: { name: `User_${uid.slice(0, 8)}` } as User };
          }
        });
        const userResults = await Promise.all(userPromises);
        const newUserCache = new Map(userCache);
        userResults.forEach(({ uid, data }) => newUserCache.set(uid, data));
        setUserCache(newUserCache);

        console.log("Fetched chats:", chatsData);
        setChats(chatsData);
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast({
          title: "Error",
          description: "Failed to load chats. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [user, authLoading, router, toast, userCache]);

  const handleChatClick = (chatId: string) => {
    console.log("Navigating to chat:", chatId);
    router.push(`/dashboard/chat/${chatId}`);
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="relative"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <h1 className="mb-8 text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 z-10">
        Your Conversations
      </h1>
      {chats.length === 0 ? (
        <div className="text-center text-lg text-gray-300 z-10">
          No chats yet. Start a conversation from the posts page!
        </div>
      ) : (
        <div className="space-y-4 z-10">
          {chats.map((chat, index) => {
            const otherParticipant = chat.participants.find(
              (uid) => uid !== user?.uid
            );
            const participantData = otherParticipant
              ? userCache.get(otherParticipant) || {
                  name: `User_${otherParticipant.slice(0, 8)}`,
                }
              : { name: "Unknown" };
            return (
              <motion.div
                key={chat.id}
                variants={featureCardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Card
                  variant="elevated"
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="flex items-center gap-4 p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={participantData.photoURL || "/images/avatar.png"}
                        alt={participantData.name}
                      />
                      <AvatarFallback>{participantData.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {participantData.name}
                      </h3>
                      <p className="text-sm text-gray-300 truncate">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                      {chat.lastMessageTime && (
                        <p className="text-xs text-gray-400">
                          {chat.lastMessageTime.toDate().toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      className="text-purple-400 hover:bg-purple-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatClick(chat.id);
                      }}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}