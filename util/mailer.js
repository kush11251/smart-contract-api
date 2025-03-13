const nodemailer = require('nodemailer');
require('dotenv').config();
const sendSuccessEmail = async (email, link, name) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',  // or any email service you prefer
            auth: {
                user: process.env.mailer_email,  // Your email
                pass: process.env.mailer_passowe    // Your email password or app-specific password
            }
        });

        let mailOptions = {
            from: '"Bajaj Finserv Team" <your-email@gmail.com>',
            to: email,
            subject: 'Your Loan Document is Ready - Bajaj Finserv',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007BFF;">Dear ${name},</h2>
                    <p>We are pleased to inform you that your loan document has been successfully generated.</p>
                    <p>You can access your document using the link below:</p>
                    <p><a href="${link}" style="color: #28a745; font-weight: bold;">View Your Loan Document</a></p>
                    <p>Please review the document carefully and reach out to our support team if you have any questions.</p>
                    <p>Thank you for choosing Bajaj Finserv.</p>
                    <p style="margin-top: 20px;">Best Regards,<br><strong>Bajaj Finserv Team</strong></p>
                    <div style="margin-top: 30px; font-size: 12px; color: #888;">
                        This is an automated email, please do not reply.
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendSuccessEmail;
