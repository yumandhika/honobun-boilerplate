import twilio from 'twilio';
import { envConfig } from '../config/config';

const client = twilio(envConfig.twilio.accountSid, envConfig.twilio.authToken);

export const sendOtpToWhatsApp = async (to: string, otp: string): Promise<void> => {
  try {
    const message = `Your Axel OTP code is: ${otp}. Please use this code to complete your verification.`;

    await client.messages.create({
      body: message,
      from: envConfig.twilio.whatsappFrom,
      to: `whatsapp:${to}`
    });

    console.log(`OTP sent to ${to} via WhatsApp.`);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw new Error('Failed to send OTP via WhatsApp');
  }
};
