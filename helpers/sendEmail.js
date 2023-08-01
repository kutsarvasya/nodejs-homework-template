import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { MAIL_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: "vkutsar89@mail.ru",
    pass: MAIL_PASSWORD,
  },
});

const mailer = async (massage) => {
  transporter.sendMail(massage, (err, info) => {
    if (err) return console.log("ошибка", err);
    console.log(info);
  });
  return true;
};

export default mailer;
