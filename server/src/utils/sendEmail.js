const nodeMailer = require('nodemailer');
require('dotenv').config();

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
    }
});  




const sendOTPEmail = async (to, otp) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEVELOPMENT FALLBACK] OTP code for ${to} is: ${otp}`);
        }
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your OTP for StreamMate',
        text: `Your OTP for StreamMate is: ${otp}. It is valid for 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending OTP email to ${to}:`, error.message);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEVELOPMENT FALLBACK] OTP code for ${to} is: ${otp}`);
        }
        // Do not throw so local registration does not crash if email is unconfigured
    }
};

module.exports = sendOTPEmail;