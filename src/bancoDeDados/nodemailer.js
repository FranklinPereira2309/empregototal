const nodemailer = require('nodemailer');
const { MailtrapTransport } = require("mailtrap");
require('dotenv').config();


const transport = nodemailer.createTransport(
    MailtrapTransport({
        token: process.env.MAIL_TOKEN,
        testInboxId: process.env.ID_TESTINBOX ,
    })
);

// const sender = {
//     address: "empregototal_adm@gmail.com",
//     name: "Emprego Total",
// };
// const recipients = [
//     "franklin.dev.full@gmail.com",
// ];

// transport
//     .sendMail({
//         from: sender,
//         to: recipients,
//         subject: "Processo Seletivo encerrado!",
//         text: "Congrats for sending test email with Mailtrap!",
//         category: "Integration Test",
//         sandbox: true
//     })
//     .then(console.log, console.error);





module.exports = transport;