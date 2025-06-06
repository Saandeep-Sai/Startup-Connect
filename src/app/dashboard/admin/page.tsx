"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/components/AuthProvider";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Trash2, Search, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { NotificationBell } from "@/components/NotificationBell";

interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AdminPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      toast({
        title: "Access Denied",
        description: "Only admins can access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as UserData)
        );
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users.",
          variant: "destructive",
        });
      }
    };

    if (!loading && user) {
      fetchUsers();
    }
  }, [user, loading, router, toast]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", id));
      setUsers(users.filter((user) => user.id !== id));
      toast({
        title: "Success",
        description: "User deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleChat = async (userId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start a chat.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (userId === user.uid) {
      toast({
        title: "Error",
        description: "You cannot chat with yourself.",
        variant: "destructive",
      });
      return;
    }

    setSelectedUserId(userId);
    setChatModalOpen(true);
  };

  const handleStartChat = async () => {
    if (!user || !selectedUserId || !chatMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid message to start a chat.",
        variant: "destructive",
      });
      return;
    }

    try {
      const chatRef = doc(collection(db, "chats"));
      await setDoc(chatRef, {
        participants: [user.uid, selectedUserId],
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "chats", chatRef.id, "messages"), {
        senderId: user.uid,
        text: chatMessage,
        timestamp: serverTimestamp(),
      });

      toast({
        title: "Success",
        description: "Chat started successfully!",
      });
      setChatMessage("");
      setSelectedUserId(null);
      setChatModalOpen(false);
      router.push(`/dashboard/chat/${chatRef.id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      `${user.firstName || ""} ${user.lastName || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex-1 p-4 ml-0 lg:ml-60 max-w-5xl mx-auto"
    >
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          Admin Dashboard
        </h1>
        <NotificationBell />
      </header>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full max-w-sm text-sm"
            variant="outline"
          />
        </div>
      </div>
      <Card variant="elevated" className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100 text-lg">
            Manage Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-300">
              No users found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {user.firstName || ""} {user.lastName || ""}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {user.email || "N/A"}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                      {user.role || "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChat(user.id)}
                      className="text-blue-600 dark:text-blue-400 text-xs"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isChatModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card
            variant="elevated"
            className="p-4 max-w-sm w-full bg-white dark:bg-gray-800"
          >
            <CardHeader>
              <CardTitle className="text-lg">Start a Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                variant="outline"
                className="text-sm"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setChatModalOpen(false);
                  setChatMessage("");
                  setSelectedUserId(null);
                }}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleStartChat}
                disabled={!chatMessage.trim()}
                className="text-xs"
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