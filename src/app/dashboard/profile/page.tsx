"use client";
   import { useContext, useEffect, useState } from 'react';
   import { AuthContext } from '@/components/AuthProvider';
   import { useRouter } from 'next/navigation';
   import { db } from '@/firebase';
   import { doc, getDoc, updateDoc } from 'firebase/firestore';
   import { motion } from 'framer-motion';
   import { User } from 'lucide-react';
   import Image from 'next/image';

   export default function Profile() {
     const { user } = useContext(AuthContext);
     const router = useRouter();
     const [firstName, setFirstName] = useState("");
     const [lastName, setLastName] = useState("");
     const [email, setEmail] = useState("");
     const [role, setRole] = useState("");
     const [profilePicture, setProfilePicture] = useState("");

     useEffect(() => {
       if (!user) {
         router.push('/login');
         return;
       }

       const fetchProfile = async () => {
         const userDoc = await getDoc(doc(db, 'users', user.uid));
         const data = userDoc.data();
         setFirstName(data?.firstName || "");
         setLastName(data?.lastName || "");
         setEmail(data?.email || "");
         setRole(data?.role || "");
         setProfilePicture(data?.profilePicture || "");
       };

       fetchProfile();
     }, [user, router]);

     const handleUpdate = async () => {
       if (!user) return;

       try {
         await updateDoc(doc(db, 'users', user.uid), {
           firstName,
           lastName,
           email,
           role,
           profilePicture,
         });
         alert('Profile updated!');
       } catch (err) {
         console.error('Error updating profile:', err);
       }
     };

     return (
       <div className="max-w-3xl mx-auto">
         <motion.h1
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-4xl font-bold text-text-primary mb-6"
         >
           Your Profile
         </motion.h1>
         <div className="card">
           <div className="flex items-center gap-4 mb-6">
             {profilePicture ? (
               <Image
                 src={profilePicture}
                 alt="Profile"
                 width={80}
                 height={80}
                 className="w-20 h-20 rounded-full object-cover"
               />
             ) : (
               <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                 <User className="w-10 h-10 text-gray-500" />
               </div>
             )}
             <h2 className="text-2xl font-semibold text-text-primary">{firstName} {lastName}</h2>
           </div>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-text-primary mb-1">First Name</label>
               <input
                 className="input"
                 type="text"
                 value={firstName}
                 onChange={(e) => setFirstName(e.target.value)}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
               <input
                 className="input"
                 type="text"
                 value={lastName}
                 onChange={(e) => setLastName(e.target.value)}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
               <input
                 className="input"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
               <input
                 className="input"
                 type="text"
                 value={role}
                 disabled
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-text-primary mb-1">Profile Picture URL</label>
               <input
                 className="input"
                 type="text"
                 value={profilePicture}
                 onChange={(e) => setProfilePicture(e.target.value)}
               />
             </div>
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleUpdate}
               className="btn-primary"
             >
               Update Profile
             </motion.button>
           </div>
         </div>
       </div>
     );
   }