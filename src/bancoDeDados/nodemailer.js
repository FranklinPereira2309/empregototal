const nodemailer = require('nodemailer');
const { MailtrapTransport } = require("mailtrap");
require('dotenv').config();

const transport = nodemailer.createTransport(
    MailtrapTransport({
        token: process.env.MAIL_TOKEN,
        testInboxId: process.env.ID_TESTINBOX,
        accountId: process.env.ID_ACCOUNT
    })
);
// const transport = nodemailer.createTransport(
//     MailtrapTransport({
//         host: process.env.MAIL_HOST,
//         port: process.env.MAIL_PORT,
//         auth: {
//             user: process.env.AUTH_USER,
//             pass: process.env.AUTH_PASS
//         }
//     })
// );

module.exports = transport;