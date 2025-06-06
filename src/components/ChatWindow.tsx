"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

interface Props {
  chatId: string;
  recipientId: string;
}

const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function ChatWindow({ chatId, recipientId }: Props) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch recipient name
    const fetchRecipient = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", recipientId));
        if (userDoc.exists()) {
          setRecipientName(
            `${userDoc.data().firstName || ""} ${
              userDoc.data().lastName || ""
            }`.trim() || `User_${recipientId.slice(0, 8)}`
          );
        }
      } catch (err) {
        console.error("Error fetching recipient:", err);
      }
    };

    // Real-time messages
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Message)
        )
      );
      scrollToBottom();
    });

    // Typing indicator simulation
    const typingTimeout = setTimeout(() => setIsTyping(false), 2000);

    fetchRecipient();
    return () => {
      unsubscribe();
      clearTimeout(typingTimeout);
    };
  }, [user, chatId, recipientId]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });

      await addDoc(
        collection(db, `notifications/${recipientId}/userNotifications`),
        {
          type: "chat",
          senderId: user.uid,
          message: `New message from ${user.displayName || "User"}`,
          createdAt: serverTimestamp(),
          read: false,
        }
      );

      setNewMessage("");
      setIsTyping(true);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-white dark:bg-gray-800 h-[500px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Chat with {recipientName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              className={`flex ${
                msg.senderId === user?.uid ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.senderId === user?.uid
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                <p>{msg.text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {msg.timestamp?.toDate().toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          {isTyping && <p className="text-sm text-gray-500">Typing...</p>}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardContent className="flex items-center gap-2 p-4">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMessage(e.target.value)
            }
            className="text-black dark:text-white"
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && handleSendMessage()
            }
          />
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 to-purple-700 text-white"
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
