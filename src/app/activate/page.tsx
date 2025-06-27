/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { sendOtpAction, verifyOtpAction } from '@/app/actions/authActions';
import { motion } from 'framer-motion';
import bcrypt from 'bcryptjs';

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

interface OtpFormData {
  otp: string;
}

export default function ActivateAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activationEmail, setActivationEmail] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(300);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [otp, setOtp] = useState('');
  const [storedOtp, setStoredOtp] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [pending, setPending] = useState<null | {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: string;
    createdAt: string;
  }>(null);

  useEffect(() => {
    if (otpTimer <= 0) {
      setIsOtpExpired(true);
      console.log('OTP has expired');
      return;
    }
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    console.log('Checking sessionStorage for pendingRegistration:', sessionStorage.getItem('pendingRegistration'));
    const raw = sessionStorage.getItem('pendingRegistration');
    if (!raw) {
      toast({
        title: "Error",
        description: "No registration data. Please register again.",
        variant: "destructive",
      });
      router.push('/register');
      return;
    }
    const data = JSON.parse(raw);
    if (!data.uid || !data.email || !data.firstName || !data.lastName || !data.role || !data.createdAt) {
      console.log('Invalid pendingRegistration data:', data);
      toast({
        title: "Error",
        description: "Invalid registration data. Please register again.",
        variant: "destructive",
      });
      router.push('/register');
      return;
    }
    setPending(data);

    // Check for stored OTP
    const otpDataRaw = sessionStorage.getItem('otpData');
    if (!otpDataRaw) {
      console.log('No OTP data found in sessionStorage');
      toast({
        title: "Error",
        description: "No OTP data found. Please resend OTP.",
        variant: "destructive",
      });
      setIsOtpExpired(true);
      return;
    }
    try {
      const otpData = JSON.parse(otpDataRaw);
      if (!otpData.otp || !otpData.expiresAt) {
        console.log('Invalid OTP data in sessionStorage:', otpData);
        toast({
          title: "Error",
          description: "Invalid OTP data. Please resend OTP.",
          variant: "destructive",
        });
        setIsOtpExpired(true);
        return;
      }
      setStoredOtp(otpData.otp);
      setOtpExpiresAt(otpData.expiresAt);
      const timeLeft = Math.max(0, Math.floor((new Date(otpData.expiresAt).getTime() - Date.now()) / 1000));
      setOtpTimer(timeLeft);
      setIsOtpExpired(timeLeft <= 0);
      console.log('OTP data loaded from sessionStorage:', { otp: otpData.otp, expiresAt: otpData.expiresAt, timeLeft });
    } catch (error: any) {
      console.error('Error parsing OTP data:', error.message);
      toast({
        title: "Error",
        description: "Failed to load OTP data. Please resend OTP.",
        variant: "destructive",
      });
      setIsOtpExpired(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : 'No user');
      if (currentUser) {
        setUser(currentUser);
        let email: string | null = data.email || sessionStorage.getItem('activationEmail');
        if (!email && currentUser.email) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              email = userDoc.data().email ?? null;
              if (email) {
                setActivationEmail(email);
                sessionStorage.setItem('activationEmail', email);
              }
              console.log('Fetched email from Firestore:', email);
            }
          } catch (error: any) {
            console.error('Error fetching user email:', error.message);
          }
        } else {
          setActivationEmail(email);
        }

        // Check if already verified
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().emailVerified) {
          console.log('User already verified, redirecting to /home');
          sessionStorage.removeItem('pendingRegistration');
          sessionStorage.removeItem('activationEmail');
          sessionStorage.removeItem('otpData');
          router.push('/dashboard');
        }
      } else {
        setUser(null);
        setActivationEmail(null);
        setPending(null);
        sessionStorage.removeItem('pendingRegistration');
        sessionStorage.removeItem('activationEmail');
        sessionStorage.removeItem('otpData');
        toast({
          title: "Error",
          description: "No user logged in. Please register again.",
          variant: "destructive",
        });
        router.push('/register');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  const handleOtpSubmit = async ({ otp: enteredOtp }: OtpFormData) => {
    if (!user || !activationEmail || !pending) {
      toast({
        title: "Error",
        description: "Invalid activation state.",
        variant: "destructive",
      });
      return;
    }
    if (!storedOtp || !otpExpiresAt) {
      toast({
        title: "Error",
        description: "No OTP data available. Please resend OTP.",
        variant: "destructive",
      });
      return;
    }
    if (isOtpExpired) {
      toast({
        title: "Error",
        description: "OTP has expired. Please resend OTP.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      console.log('Submitting OTP for verification:', { enteredOtp, storedOtp, otpExpiresAt });
      const verifyResponse = await verifyOtpAction(activationEmail, enteredOtp, storedOtp, otpExpiresAt);
      if (!verifyResponse.success) {
        console.log('OTP verification failed:', verifyResponse.message);
        throw new Error(verifyResponse.message);
      }
      console.log('OTP verified successfully for email:', activationEmail);

      // Ensure user is authenticated before writing to Firestore
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(pending.password, 10);

      // Write user profile to Firestore with merge option
      await setDoc(doc(db, 'users', pending.uid), {
        firstName: pending.firstName,
        lastName: pending.lastName,
        name: `${pending.firstName} ${pending.lastName}`,
        email: pending.email,
        role: pending.role,
        password: hashedPassword,
        emailVerified: true,
        createdAt: pending.createdAt,
        verifiedAt: new Date().toISOString(),
      }, { merge: true });

      console.log('User profile written to Firestore for UID:', pending.uid);

      // Cleanup & redirect
      sessionStorage.removeItem('pendingRegistration');
      sessionStorage.removeItem('activationEmail');
      sessionStorage.removeItem('otpData');
      toast({
        title: 'Activated!',
        description: 'Welcome aboard!',
      });
      router.push('/home');
    } catch (error: any) {
      console.error('Activation error:', error.message, error.code);
      const errorMessage = error.code === 'PERMISSION_DENIED'
        ? 'Insufficient permissions to save user data. Please contact support at support@startupconnect.com.'
        : error.message || 'Activation Error';
      toast({
        title: 'Activation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!activationEmail) {
      toast({
        title: "Error",
        description: "No email available for OTP resend.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const otpResponse = await sendOtpAction(activationEmail);
      if (!otpResponse.success) {
        throw new Error(otpResponse.message);
      }
      console.log('New OTP sent to:', activationEmail, 'OTP:', otpResponse.otp);
      // Store new OTP in sessionStorage
      sessionStorage.setItem('otpData', JSON.stringify({
        otp: otpResponse.otp,
        expiresAt: otpResponse.expiresAt,
      }));
      setStoredOtp(otpResponse.otp);
      setOtpExpiresAt(otpResponse.expiresAt);
      setOtpTimer(300);
      setIsOtpExpired(false);
      toast({
        title: 'OTP Sent',
        description: `Check ${activationEmail}`,
        duration: 10000,
      });
    } catch (error: any) {
      console.error('Error resending OTP:', error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend OTP.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !activationEmail || !pending) {
    return (
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">Activation Link Expired or Invalid</h1>
        <p className="mb-4 text-muted-foreground">Please register again to receive a new activation link.</p>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          onClick={() => router.push('/register')}
        >
          Go to Registration
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-foreground">Activate Your Account</h1>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Enter the OTP sent to {activationEmail} to activate your account.
      </p>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        OTP expires in: <span className={isOtpExpired ? 'text-destructive' : ''}>{formatTimer(otpTimer)}</span>
      </p>
      <div className="space-y-4">
        <Input
          placeholder="Enter the OTP from your email"
          value={otp}
          onChange={(e) => setOtp(e.target.value.trim())}
          disabled={isOtpExpired || isLoading}
        />
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            className="w-full"
            onClick={() => handleOtpSubmit({ otp })}
            disabled={isLoading || isOtpExpired}
          >
            {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : 'Verify OTP'}
          </Button>
        </motion.div>
        {isOtpExpired && (
          <div className="mt-4 text-center">
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : 'Resend OTP'}
              </Button>
            </motion.div>
          </div>
        )}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Wrong email?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register again
        </Link>
      </p>
    </>
  );
}