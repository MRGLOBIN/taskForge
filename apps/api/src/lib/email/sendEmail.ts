import nodemailer from "nodemailer";
import { AppError } from "../appError/appError.error";

type Details = {
  to: string;
  subject: string;
  html: string;
};

const transportor = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_MAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export const sendEmail = async (details: Details): Promise<boolean> => {
  try {
    const info = await transportor.sendMail({
      from: `"TaskForge <${process.env.GOOGLE_MAIL_USER}`,
      to: details.to,
      subject: details.subject,
      html: details.html,
    });

    if (info.rejected.length > 0) {
      throw new AppError("Email was rejected");
    }

    return true;
  } catch (err) {
    throw new AppError("Failed to send email ", 500);
  }
};

const testDeails: Details = {
  to: "knownu035@gmail.com",
  subject: "hi bro",
  html: "<p> did you miss me?<p>",
};

sendEmail(testDeails);
