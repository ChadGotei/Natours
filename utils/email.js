import nodemailer from "nodemailer";

const sendEmail = async options => {
    // 1) create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // 2) Define the email options
    const mailOptions = {
        from: 'Gaurav Sharma <gauravsb105@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message, 
    };


    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
}

export default sendEmail;