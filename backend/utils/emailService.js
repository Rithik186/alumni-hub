import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

export const sendEmailOtp = async (toEmail, otpCode, userName) => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { name: 'Alumned In', email: SENDER_EMAIL },
                to: [{ email: toEmail, name: userName }],
                subject: 'Your Alumned In OTP Verification Code',
                htmlContent: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="background-color: #4f46e5; width: 60px; height: 60px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                <span style="color: white; font-size: 30px; font-weight: bold;">AI</span>
                            </div>
                            <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Alumned In</h1>
                            <p style="color: #666; margin-top: 8px; font-weight: 500;">Your Journey, Your Network, Your Legacy.</p>
                        </div>
                        
                        <div style="background-color: #f8fafc; border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #edf2f7;">
                            <p style="color: #4a5568; margin-top: 0; font-size: 16px; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">To ensure the security of your account, please use the verification code below to complete your registration or login process.</p>
                            
                            <div style="margin: 35px 0; text-align: center;">
                                <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 2px; border-radius: 16px; display: inline-block;">
                                    <div style="background-color: #ffffff; padding: 20px 40px; border-radius: 14px;">
                                        <span style="font-size: 42px; font-weight: 900; letter-spacing: 8px; color: #1a1a1a; font-family: monospace;">${otpCode}</span>
                                    </div>
                                </div>
                                <p style="color: #718096; font-size: 13px; margin-top: 15px; font-weight: 600; text-transform: uppercase; tracking: 1px;">Valid for 10 minutes</p>
                            </div>
                        </div>
                        
                        <div style="color: #718096; font-size: 14px; line-height: 1.6;">
                            <p style="margin-bottom: 10px;">If you didn't request this code, you can safely ignore this email. Someone might have typed your email address by mistake.</p>
                            <p>Best regards,<br /><strong style="color: #4f46e5;">The Alumned In Team</strong></p>
                        </div>
                        
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
                            <p style="font-size: 12px; color: #a0aec0;">&copy; 2026 Alumned In Platform. All rights reserved.</p>
                        </div>
                    </div>
                `
            },
            {
                headers: {
                    'api-key': BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Brevo Email Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to send email OTP');
    }
};
