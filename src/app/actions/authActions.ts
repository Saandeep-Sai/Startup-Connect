/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/actions/authActions.ts
"use server";

import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(email: string, otp: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Account Activation OTP',
      text: `Your OTP is: ${otp}. Expires in 5 minutes.`,
      html:`<div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>StartUp Connect OTP Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for Startup Connect is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #007bff;">${otp}</p>
        <p>This OTP is valid for 5 minutes. Please do not share this code with anyone.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <hr/>
        <p style="font-size: 0.9em; color: #555;">This is an automated message. Please do not reply directly to this email.</p>
      </div>`
    });
    console.log(`Email sent to ${email} with OTP: ${otp}`);
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email. Please check your email address.');
  }
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpAction(email: string) {
  try {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 300 * 1000);
    console.log('Generated OTP for:', email, 'OTP:', otp, 'ExpiresAt:', expiresAt.toISOString());
    await sendEmail(email, otp);
    return {
      success: true,
      message: `OTP sent to ${email}`,
      otp,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error: any) {
    console.error('Error sending OTP:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    };
  }
}

export async function verifyOtpAction(email: string, otp: string, storedOtp: string, expiresAt: string) {
  try {
    console.log('Verifying OTP for:', email, 'Entered OTP:', otp, 'Stored OTP:', storedOtp, 'ExpiresAt:', expiresAt);
    const expiresAtDate = new Date(expiresAt);
    if (isNaN(expiresAtDate.getTime())) {
      console.log('Invalid expiration date for:', email);
      return { success: false, message: 'Invalid OTP data' };
    }
    if (new Date() > expiresAtDate) {
      console.log('OTP expired for:', email);
      return { success: false, message: 'OTP has expired' };
    }
    if (String(storedOtp).trim() !== String(otp).trim()) {
      console.log('Invalid OTP for:', email, 'Stored:', storedOtp, 'Entered:', otp);
      return { success: false, message: 'Invalid OTP' };
    }
    console.log('OTP verified successfully for:', email);
    // Save OTP to Firebase after verification
    const otpDoc = doc(db, 'otps', email);
    await setDoc(otpDoc, {
      otp,
      email,
      expiresAt,
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    });
    console.log('OTP stored in Firebase for:', email);
    return { success: true, message: 'OTP verified successfully' };
  } catch (error: any) {
    console.error('Error verifying OTP:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to verify OTP',
    };
  }
}