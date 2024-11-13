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
// const transport = nodemailer.createTransport({
//         host: smtp.gmail.com,
//         service:'gmail',
//         secure: true,
//         auth: {
//             user: 'empregototal.adm@gmail.com',
//             pass: '1020'
//         }
//     });

module.exports = transport;