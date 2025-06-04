import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send OTP email
    await transporter.sendMail({
      from: `"Startup Connect" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Your OTP for Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Startup Connect Registration</h2>
          <p>Your OTP for registration is:</p>
          <h3 style="color: #007bff; font-size: 24px;">${otp}</h3>
          <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,<br/>Startup Connect Team</p>
        </div>
      `,
    });

    return NextResponse.json({ otp, expires }, { status: 200 });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}