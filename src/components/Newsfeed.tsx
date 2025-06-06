"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";

interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string | undefined;
  createdAt: Timestamp | null;
  userName?: string;
}

const newsfeedVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Newsfeed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Post)
        );

        // Fetch user names
        const userIds = new Set(postsData.map((post) => post.userId));
        const userPromises = Array.from(userIds).map(async (uid) => {
          const userDoc = await getDoc(doc(db, "users", uid));
          return {
            id: uid,
            name: userDoc.exists()
              ? `${userDoc.data().firstName || ""} ${
                  userDoc.data().lastName || ""
                }`.trim() || `User_${uid.slice(0, 8)}`
              : `User_${uid.slice(0, 8)}`,
          };
        });
        const users = await Promise.all(userPromises);
        const userMap = new Map(users.map((u) => [u.id, u.name]));

        setPosts(
          postsData.map((post) => ({
            ...post,
            userName: userMap.get(post.userId),
          }))
        );
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          variants={newsfeedVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white dark:bg-gray-800 card">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {post.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Posted by {post.userName} on{" "}
                {post.createdAt?.toDate().toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
