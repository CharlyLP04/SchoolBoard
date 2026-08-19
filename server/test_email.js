import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pruebasschool6@gmail.com',
    pass: 'hnddiqfqxemnvfii'
  }
});

async function test() {
  try {
    await transporter.verify();
    console.log('Credentials are valid.');
  } catch (error) {
    console.error('Credentials invalid or blocked:', error);
  }
}

test();
