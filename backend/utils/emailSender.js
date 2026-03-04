import nodemailer from 'nodemailer'
import 'dotenv/config'

const transport = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth:{
        user: process.env.MAIL,
        pass: process.env.GENERATED_MAIL_APP_PASSWORD
    }
})

export const emailSender = (to, subject, content) => {
    transport.sendMail({
        to,
        subject,
        html: content
    })
}