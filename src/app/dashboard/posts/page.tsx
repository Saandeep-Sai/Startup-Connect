"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { db } from "@/firebase";
import { collection, query, getDocs, doc, setDoc, addDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: "startup" | "investment";
  createdAt?: Timestamp;
  userName: string;
  userPhotoURL?: string;
}

interface SelectedItem {
  id: string;
  userId: string;
  type: "startup" | "investment";
}

export default function PostsPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view posts.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    const fetchPosts = async () => {
      try {
        console.log("Fetching posts for user:", user.uid);
        const postsQuery = query(collection(db, "posts"));
        const postsSnapshot = await getDocs(postsQuery);
        const postsData: Post[] = [];

        for (const postDoc of postsSnapshot.docs) {
          const postData = postDoc.data();
          const userDoc = await getDoc(doc(db, "users", postData.userId));
          const userName = userDoc.exists()
            ? `${userDoc.data().firstName || ""} ${userDoc.data().lastName || ""}`.trim() || `User_${postData.userId.slice(0, 8)}`
            : `User_${postData.userId.slice(0, 8)}`;

          if (!postData.createdAt) {
            console.warn(`Post ${postDoc.id} has no createdAt field:`, postData);
          }
          if (!["startup", "investment"].includes(postData.type)) {
            console.warn(`Skipping post ${postDoc.id} due to invalid type:`, postData.type);
            continue;
          }

          postsData.push({
            id: postDoc.id,
            userId: postData.userId,
            title: postData.title,
            description: postData.description,
            type: postData.type as "startup" | "investment",
            createdAt: postData.createdAt,
            userName,
            userPhotoURL: userDoc.exists() ? userDoc.data().photoURL : undefined,
          });
        }

        console.log("Fetched posts:", postsData);
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user, authLoading, router, toast]);

  const handleStartChat = async () => {
    if (!user || !selectedItem) {
      console.log("Cannot start chat: user or selectedItem missing", { user, selectedItem });
      toast({
        title: "Error",
        description: "Please log in and select a post to start a chat.",
        variant: "destructive",
      });
      return;
    }
    if (!["startup", "investment"].includes(selectedItem.type)) {
      console.log("Invalid itemType:", selectedItem.type);
      toast({
        title: "Error",
        description: "Invalid post type. Cannot start chat.",
        variant: "destructive",
      });
      return;
    }
    try {
      console.log("Starting chat for post:", selectedItem, "with message:", chatMessage);
      const chatRef = doc(collection(db, "chats"));
      await setDoc(chatRef, {
        participants: [user.uid, selectedItem.userId],
        itemId: selectedItem.id,
        itemType: selectedItem.type,
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
      setSelectedItem(null);
      setShowChatModal(false);
      router.push(`/dashboard/chat/${chatRef.id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openChatModal = (post: Post) => {
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
    if (post.userId === user.uid) {
      console.log("User attempted to chat with self");
      toast({
        title: "Invalid Action",
        description: "You cannot chat with yourself.",
        variant: "destructive",
      });
      return;
    }
    if (!["startup", "investment"].includes(post.type)) {
      console.log("Cannot open chat modal: invalid post type:", post.type, "for post:", post);
      toast({
        title: "Error",
        description: "This post has an invalid type.",
        variant: "destructive",
      });
      return;
    }
    console.log("Opening chat modal for post:", post);
    setSelectedItem({
      id: post.id,
      userId: post.userId,
      type: post.type,
    });
    setShowChatModal(true);
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
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
      <h1 className="mb-8 text-3xl font-bold text-blue-600 dark:text-blue-400">
        Explore Opportunities
      </h1>
      {posts.length === 0 ? (
        <div className="text-center text-lg text-gray-600 dark:text-gray-300">
          No posts available. Create one to get started!
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <Card
              key={post.id}
              variant="elevated"
              className="hover:shadow-2xl transition-shadow duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.userPhotoURL || "/images/avatar.png"} alt={post.userName} />
                    <AvatarFallback>{post.userName[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle>
                    <Link href={`/dashboard/profile/${post.userId}`} className="hover:underline text-blue-600 dark:text-blue-400">
                      {post.userName}
                    </Link>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Posted on {post.createdAt ? post.createdAt.toDate().toLocaleDateString() : "Unknown date"}
                </div>
                <div className="mt-1 text-sm text-blue-600 dark:text-blue-400 capitalize">
                  {post.type}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => openChatModal(post)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
                  setSelectedItem(null);
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