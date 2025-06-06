"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Timestamp } from "firebase/firestore";
import { motion } from "framer-motion";

interface Notification {
  id: string;
  type: "chat" | "request_accepted" | "request_rejected";
  senderId: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
}

interface User {
  id: string;
  name: string;
}

export function NotificationBell() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for notifications
    const q = query(
      collection(db, `notifications/${user.uid}/userNotifications`),
      where("read", "==", false)
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const notifs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Notification)
      );
      setNotifications(notifs);

      // Fetch sender names
      const userIds = new Set<string>(notifs.map((n) => n.senderId));
      const userPromises = Array.from(userIds).map(async (uid) => {
        const userDoc = await getDoc(doc(db, "users", uid));
        return {
          id: uid,
          name: userDoc.exists()
            ? `${userDoc.data().firstName || ""} ${
                userDoc.data().lastName || ""
              }`.trim() || `User_${uid.slice(0, 8)}`
            : `User_${uid.slice(0, 8)}`,
        } as User;
      });
      const users = await Promise.all(userPromises);
      setUserCache(new Map(users.map((u) => [u.id, u])));
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async () => {
    if (!user) return;
    try {
      const batch = notifications.map((notif) =>
        updateDoc(
          doc(db, `notifications/${user.uid}/userNotifications`, notif.id),
          { read: true }
        )
      );
      await Promise.all(batch);
      setNotifications([]);
      setIsOpen(false);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="relative text-gray-600 dark:text-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </Button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-80 z-50"
        >
          <Card variant="elevated" className="p-4 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Notifications
            </h3>
            {notifications.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                No new notifications.
              </p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {notif.message} from{" "}
                    {userCache.get(notif.senderId)?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {notif.createdAt.toDate().toLocaleString()}
                  </p>
                </div>
              ))
            )}
            {notifications.length > 0 && (
              <Button
                onClick={handleMarkAsRead}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark All as Read
              </Button>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}
