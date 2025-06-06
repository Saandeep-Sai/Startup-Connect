/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContext } from '@/components/AuthProvider';
import { db } from '@/firebase';
import {
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  addDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader2, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Select } from '@/components/ui/select';

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

export default function Posts() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view posts.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    const fetchPosts = async () => {
      try {
        console.log('Fetching posts for user:', user.uid);
        const postsQuery = query(collection(db, 'posts'));
        const postsSnapshot = await getDocs(postsQuery);
        const postsData: Post[] = [];

        for (const postDoc of postsSnapshot.docs) {
          const postData = postDoc.data();
          const userDoc = await getDoc(doc(db, 'users', postData.userId));
          const userName = userDoc.exists()
            ? `${userDoc.data().firstName || ""} ${userDoc.data().lastName || ""}`.trim() || `User_${postData.userId.slice(0, 8)}`
            : `User_${postData.userId.slice(0, 8)}`;

          if (!postData.createdAt) {
            console.warn(`Post ${postDoc.id} has no createdAt field:`, postData);
          }
          if (!["startup", "investment"].includes(postData.type)) {
            console.warn(
              `Skipping post ${postDoc.id} due to invalid type: ${postData.type}`,
            );
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
            userPhotoURL: userDoc.exists()
              ? userDoc.data().photoURL
              : undefined,
          });
        }

        console.log('Fetched posts:', postsData);
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
      console.log("User or selected item missing", {
        user,
        selectedItem,
      });
      toast({
        title: "Error",
        description: "Please log in and select a post to start a chat.",
        variant: "destructive",
      });
      return;
    }
    if (!["startup", "investment"].includes(selectedItem.type)) {
      console.log("Invalid post type:", selectedItem.type);
      toast({
        title: "Invalid Post Type",
        description: "Cannot start chat due to invalid post type.",
        variant: "destructive",
      });
      return;
    }
    try {
      console.log(
        "Starting a chat for post:",
        selectedItem,
        "with message:",
        chatMessage,
      );
      const chatRef = doc(collection(db, "chats"));
      await setDoc(chatRef, {
        participants: [user.uid, selectedItem.userId],
        itemId: selectedItem.id,
        itemType: selectedItem.type,
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, "chats", chatRef.id, "messages"), {
        senderId: user.uid,
        text: chatMessage,
        timestamp: serverTimestamp(),
      });

      console.log("Chat created with ID:", chatRef.id);
      toast({
        title: "Success",
        description: "Chat started successfully!",
        variant: "success",
      });
      setChatMessage('');
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
      console.log("User not logged in");
      toast({
        title: "Authentication Required",
        description: "Please log in to start a chat.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    if (post.userId === user.uid) {
      console.log("User cannot chat with self");
      toast({
        title: "Invalid Action",
        description: "You cannot chat with yourself.",
        variant: "destructive",
      });
      return;
    }
    if (!["startup", "investment"].includes(post.type)) {
      console.log("Invalid post type:", post.type, "for post:", post);
      toast({
        title: "Invalid Post",
        description: "Cannot start chat due to invalid post type.",
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

  const handleProfileClick = (userId: string) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to view profiles.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    if (isProfileLoading) {
      return; // Prevent multiple clicks
    }
    setIsProfileLoading(userId);
    try {
      if (userId === user.uid) {
        router.push('/dashboard/profile');
      } else {
        router.push(`/dashboard/profile/${userId}`);
      }
    } catch (error) {
      console.error("Error navigating to profile:", error);
      toast({
        title: "Navigation Error",
        description: "Failed to load profile.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsProfileLoading(null), 200); // Clear loading state
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-4 ml-0 lg:ml-60 max-w-5xl"
    >
      <Select />
      <h1 className="text-2xl font-semibold text-blue-600 dark:text-blue-300 mb-6">
        Explore Opportunities
      </h1>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            No posts found. Create a post to get started!
          </div>
        ) : (
          posts.map((post, index) => (
            <Card
              key={post.id}
              variant="elevated"
              className="hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.userPhotoURL || "/images/avatar.png"} alt={post.userName} />
                    <AvatarFallback>{post.userName[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle>
                    <button
                      onClick={() => handleProfileClick(post.userId)}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm"
                      disabled={isProfileLoading === post.userId}
                    >
                      {isProfileLoading === post.userId ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : null}
                      {post.userName}
                    </button>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                <CardDescription className="text-xs">{post.description}</CardDescription>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Posted on:{" "}
                  {post.createdAt
                    ? post.createdAt.toDate().toLocaleDateString()
                    : "Unknown date"}
                </div>
                <div className="mt-1 text-xs text-blue-500 dark:text-blue-600 capitalize">
                  {post.type}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="text-blue-600 dark:text-blue-400 border-blue-500 dark:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-800/20 text-xs"
                  title="Contact"
                  onClick={() => openChatModal(post)}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Contact
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {showChatModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card variant="elevated" className="p-4 max-w-sm w-full bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Start a Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your initial message..."
                variant="outline"
                className="text-sm"
              />
            </CardContent>
            <CardFooter>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  title="Cancel"
                  onClick={() => {
                    setShowChatModal(false);
                    setChatMessage('');
                    setSelectedItem(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  title="Send"
                  onClick={handleStartChat}
                  disabled={!chatMessage.trim()}
                  className="text-xs"
                >
                  Send
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}